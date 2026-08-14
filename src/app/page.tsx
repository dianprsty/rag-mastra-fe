'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { HowToUseSliderModal } from '@/components/layout/HowToUseSliderModal';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { CitationDrawer, CitationDetail } from '@/components/chat/CitationDrawer';
import { KnowledgeBaseHub } from '@/components/documents/KnowledgeBaseHub';
import { DocumentIngestModal } from '@/components/documents/DocumentIngestModal';
import {
  fetchLiveModels,
  fetchIngestedDocumentsList,
  fetchChatThreads,
  fetchThreadDetail,
  createChatThread,
  deleteChatThread,
  streamChatResponse,
  deleteDocument,
  ModelOption,
  IngestedDocInfo,
  ChatThreadItem,
  ChatMessageItem,
} from '@/lib/api';


export default function Home() {
  const [activeView, setActiveView] = useState<'chat' | 'knowledge'>('chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [chatModels, setChatModels] = useState<ModelOption[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<ModelOption[]>([]);
  const [selectedChatModel, setSelectedChatModel] = useState<string>('');
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);

  const [ingestedDocs, setIngestedDocs] = useState<IngestedDocInfo[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);

  // Chat History Threads & Per-Thread Messages Map State
  const [threads, setThreads] = useState<ChatThreadItem[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-welcome');
  const [threadMessagesMap, setThreadMessagesMap] = useState<Record<string, ChatMessageItem[]>>({});
  const [chatErrorMap, setChatErrorMap] = useState<Record<string, string | null>>({});

  const [selectedCitation, setSelectedCitation] = useState<CitationDetail | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState<boolean>(false);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const res = await fetchLiveModels();
      setChatModels(res.chatModels);
      setEmbeddingModels(res.embeddingModels);
      if (res.chatModels.length > 0 && !selectedChatModel) {
        setSelectedChatModel(res.chatModels[0].id);
      }
    } catch (err) {
      console.error('Failed to load models:', err);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const loadIngestedDocs = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await fetchIngestedDocumentsList();
      setIngestedDocs(docs);
    } catch (err) {
      console.error('Failed to load ingested documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const loadThreads = async () => {
    try {
      const list = await fetchChatThreads();
      setThreads(list);
      if (list.length > 0 && activeThreadId === 'thread-welcome') {
        setActiveThreadId(list[0].id);
        loadThreadDetail(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load chat threads:', err);
    }
  };

  const loadThreadDetail = async (threadId: string) => {
    try {
      const detail = await fetchThreadDetail(threadId);
      setThreadMessagesMap((prev) => ({
        ...prev,
        [threadId]: detail.messages || [],
      }));
    } catch (err) {
      console.error('Failed to load thread detail:', err);
    }
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    if (!threadMessagesMap[threadId]) {
      loadThreadDetail(threadId);
    }
  };

  const handleNewChat = async () => {
    try {
      const newThread = await createChatThread('New Conversation');
      setThreads((prev) => [
        {
          id: newThread.id,
          title: newThread.title,
          createdAt: newThread.createdAt,
          updatedAt: newThread.updatedAt,
          messageCount: 0,
        },
        ...prev,
      ]);
      setActiveThreadId(newThread.id);
      setThreadMessagesMap((prev) => ({
        ...prev,
        [newThread.id]: [],
      }));
    } catch (err) {
      console.error('Failed to create new chat:', err);
    }
  };

  // Active Generation & Stream Control State
  const [generatingThreadId, setGeneratingThreadId] = useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setGeneratingThreadId(null);
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || generatingThreadId) return;

    const targetThreadId = activeThreadId || 'thread-welcome';
    setGeneratingThreadId(targetThreadId);
    setChatErrorMap((prev) => ({ ...prev, [targetThreadId]: null }));

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString(),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsgPlaceholder: ChatMessageItem = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    const existingMsgs = threadMessagesMap[targetThreadId] || [];
    const newThreadMsgs = [...existingMsgs, userMsg, assistantMsgPlaceholder];

    setThreadMessagesMap((prev) => ({
      ...prev,
      [targetThreadId]: newThreadMsgs,
    }));

    const updatedMessages = newThreadMsgs
      .filter((m) => m.id !== 'welcome-msg')
      .map((m) => ({ role: m.role, content: m.content }));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let streamedText = '';

    await streamChatResponse(
      updatedMessages,
      selectedChatModel,
      targetThreadId,
      (chunk: string) => {
        streamedText += chunk;
        setThreadMessagesMap((prev) => {
          const threadMsgs = prev[targetThreadId] || [];
          return {
            ...prev,
            [targetThreadId]: threadMsgs.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: streamedText } : msg
            ),
          };
        });
      },
      () => {
        setGeneratingThreadId(null);
        abortControllerRef.current = null;
        loadThreads();
      },
      (err: any) => {
        console.error('Chat stream error:', err);
        const errorText = typeof err === 'string' ? err : err?.message || 'Failed to generate response';
        setChatErrorMap((prev) => ({ ...prev, [targetThreadId]: errorText }));

        // Clean up empty assistant placeholder if failed without generating text
        setThreadMessagesMap((prev) => {
          const threadMsgs = prev[targetThreadId] || [];
          return {
            ...prev,
            [targetThreadId]: threadMsgs.filter(
              (m) => m.id !== assistantMsgId || Boolean(m.content.trim())
            ),
          };
        });

        setGeneratingThreadId(null);
        abortControllerRef.current = null;
      },
      controller.signal
    );
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      if (generatingThreadId === threadId) {
        handleStopGeneration();
      }
      await deleteChatThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      setThreadMessagesMap((prev) => {
        const next = { ...prev };
        delete next[threadId];
        return next;
      });
      setChatErrorMap((prev) => {
        const next = { ...prev };
        delete next[threadId];
        return next;
      });
      if (activeThreadId === threadId) {
        const remaining = threads.filter((t) => t.id !== threadId);
        if (remaining.length > 0) {
          setActiveThreadId(remaining[0].id);
          loadThreadDetail(remaining[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument(docId);
      loadIngestedDocs();
    } catch (err) {
      console.error('Failed to delete document:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadModels();
    loadIngestedDocs();
    loadThreads();
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Left Minimizable Navigation Sidebar */}
      <SidebarNav
        activeView={activeView}
        onSelectView={setActiveView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        docsCount={ingestedDocs.length}
        threads={threads}
        activeThreadId={activeThreadId}
        generatingThreadId={generatingThreadId || undefined}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
      />

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <Header onOpenHowToUse={() => setIsHowToUseOpen(true)} />

        {/* Dynamic Workspace Area */}
        <main className="flex-1 p-4 overflow-hidden w-full h-full">
          {activeView === 'chat' ? (
            <div className="h-full w-full">
              <ChatInterface
                chatModels={chatModels}
                selectedChatModel={selectedChatModel}
                onSelectChatModel={setSelectedChatModel}
                isLoadingModels={isLoadingModels}
                onRefreshModels={loadModels}
                onSelectCitation={setSelectedCitation}
                activeThreadId={activeThreadId}
                initialMessages={threadMessagesMap[activeThreadId] || []}
                isGenerating={generatingThreadId === activeThreadId}
                onStopGeneration={handleStopGeneration}
                onSendMessage={handleSendMessage}
                errorMsg={chatErrorMap[activeThreadId] || null}
                onDismissError={() =>
                  setChatErrorMap((prev) => ({ ...prev, [activeThreadId]: null }))
                }
              />
            </div>



          ) : (
            <div className="h-full w-full">
              <KnowledgeBaseHub
                documents={ingestedDocs}
                isLoading={isLoadingDocs}
                onOpenUploadModal={() => setIsIngestModalOpen(true)}
                onDeleteDocument={handleDeleteDocument}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <CitationDrawer
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />

      <HowToUseSliderModal
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
        onOpenUpload={() => setIsIngestModalOpen(true)}
      />

      <DocumentIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        embeddingModels={embeddingModels}
        onIngestSuccess={loadIngestedDocs}
      />
    </div>
  );
}

