'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, Trash2, Copy, Check, Cpu, RefreshCw, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { streamChatResponse, ModelOption } from '@/lib/api';
import { CitationDetail } from './CitationDrawer';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  chatModels?: ModelOption[];
  selectedChatModel: string;
  onSelectChatModel: (modelId: string) => void;
  isLoadingModels?: boolean;
  onRefreshModels?: () => void;
  onSelectCitation: (citation: CitationDetail) => void;
  activeThreadId?: string;
  initialMessages?: ChatMessage[];
  isGenerating?: boolean;
  onStopGeneration?: () => void;
  onSendMessage?: (text: string) => void;
  errorMsg?: string | null;
  onDismissError?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatModels = [],
  selectedChatModel,
  onSelectChatModel,
  isLoadingModels = false,
  onRefreshModels,
  onSelectCitation,
  activeThreadId = 'thread-welcome',
  initialMessages,
  isGenerating: isGeneratingProp,
  onStopGeneration,
  onSendMessage,
  errorMsg: externalErrorMsg,
  onDismissError,
}) => {
  const [isMounted, setIsMounted] = useState(false);


  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDisabled = !isMounted || isLoadingModels || chatModels.length === 0;


  const defaultWelcome: ChatMessage[] = [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        "Hello! I am your **Knowledge Assistant**. Ask me questions grounded in your uploaded documents!\n\nI will cite my sources using clickable tags like `[1]` so you can easily view and verify facts.",
    },
  ];

  const messages = initialMessages && initialMessages.length > 0 ? initialMessages : defaultWelcome;




  const [input, setInput] = useState('');
  const [isGeneratingLocal, setIsGeneratingLocal] = useState(false);
  const isGenerating = isGeneratingProp !== undefined ? isGeneratingProp : isGeneratingLocal;

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input.trim();
    setInput('');
    setErrorMsg(null);

    if (onSendMessage) {
      onSendMessage(userText);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, codeId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(codeId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Helper component for text nodes containing [1], [2] citation markers
  const TextWithCitations: React.FC<{ children: string }> = ({ children }) => {
    if (typeof children !== 'string') return <>{children}</>;

    const parts = children.split(/(\[\d+\])/g);
    return (
      <>
        {parts.map((part, index) => {
          const match = part.match(/^\[(\d+)\]$/);
          if (match) {
            const num = match[1];
            return (
              <button
                key={index}
                onClick={() =>
                  onSelectCitation({
                    number: num,
                    title: `Source Document [${num}]`,
                    source: `doc-${num}`,
                    chunkIndex: parseInt(num, 10),
                    quote: `Retrieved knowledge context matching citation ID [${num}].`,
                  })
                }
                className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/40 cursor-pointer transition shadow-sm"
              >
                [{num}]
              </button>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl border border-border shadow-xl overflow-hidden">
      {/* Chat Box Top Header Bar with Model Selector */}
      <div className="px-5 py-3 border-b border-border bg-surface/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Chat Assistant</h2>
          </div>

          {isGenerating && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400 animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>Generating...</span>
            </div>
          )}
        </div>


        {/* Model Selector Dropdown inside Chat Box */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-hover border border-border text-xs">
          <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-gray-400 hidden sm:inline">Model:</span>
          <select
            value={selectedChatModel}
            onChange={(e) => onSelectChatModel(e.target.value)}
            disabled={isDisabled}
            suppressHydrationWarning
            className="bg-transparent text-indigo-300 font-medium focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[240px] truncate disabled:opacity-50"
          >
            {chatModels.map((m) => (
              <option key={m.id} value={m.id} className="bg-surface text-gray-200">
                {m.name} {m.isFree ? '⚡ (Free)' : ''}
              </option>
            ))}
          </select>

          {onRefreshModels && (
            <button
              onClick={onRefreshModels}
              title="Refresh Models"
              className="text-gray-400 hover:text-indigo-400 transition ml-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingModels ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-surface border border-border text-emerald-400'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600/90 text-white rounded-tr-none'
                  : 'bg-surface/90 border border-border text-gray-200 rounded-tl-none shadow-sm w-full'
              }`}
            >
              {msg.content ? (
                <div className="markdown-body space-y-2">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p({ children }) {
                        return (
                          <div className="mb-2 last:mb-0">
                            {React.Children.map(children, (child) =>
                              typeof child === 'string' ? (
                                <TextWithCitations>{child}</TextWithCitations>
                              ) : (
                                child
                              )
                            )}
                          </div>
                        );
                      },
                      li({ children }) {
                        return (
                          <li className="ml-4 list-disc mb-1">
                            {React.Children.map(children, (child) =>
                              typeof child === 'string' ? (
                                <TextWithCitations>{child}</TextWithCitations>
                              ) : (
                                child
                              )
                            )}
                          </li>
                        );
                      },
                      code({ node, inline, className, children, ...props }: any) {
                        const codeString = String(children).replace(/\n$/, '');
                        const codeId = `code-${codeString.length}-${codeString.slice(0, 15).replace(/\s+/g, '')}`;


                        if (inline) {
                          return (
                            <code className="px-1.5 py-0.5 rounded bg-surface-hover font-mono text-xs text-indigo-300 border border-border">
                              {children}
                            </code>
                          );
                        }

                        return (
                          <div className="relative my-3 rounded-xl bg-black/40 border border-border overflow-hidden group">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-surface/80 border-b border-border text-[11px] text-gray-400">
                              <span className="font-mono">code</span>
                              <button
                                onClick={() => copyToClipboard(codeString, codeId)}
                                className="flex items-center gap-1 hover:text-white transition"
                              >
                                {copiedCodeId === codeId ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3 overflow-x-auto text-xs font-mono leading-relaxed text-indigo-200">
                              <code>{children}</code>
                            </pre>
                          </div>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-indigo-400 text-xs animate-pulse-subtle">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Searching documents and generating answer...</span>
                </div>

              )}
            </div>
          </div>
        ))}

        {/* Quick Suggestion Cards when only welcome message exists */}

        {messages.length === 1 && !isGenerating && (
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-3xl">
            {[
              {
                icon: '📝',
                title: 'Summarize Document',
                desc: 'Get a concise overview of key points',
                prompt: 'Summarize the main points of the uploaded documents into a bulleted list.',
              },
              {
                icon: '❓',
                title: 'Generate Quiz',
                desc: 'Test your understanding with 5 questions',
                prompt: 'Generate a 5-question comprehension quiz with answer keys based on the knowledge base.',
              },
              {
                icon: '💡',
                title: 'Key Takeaways',
                desc: 'Extract main concepts & definitions',
                prompt: 'What are the key concepts, definitions, and takeaways in the document?',
              },
            ].map((card, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(card.prompt);
                }}
                className="p-3.5 rounded-xl bg-surface/60 hover:bg-surface border border-border hover:border-indigo-500/50 text-left transition group cursor-pointer shadow-sm"
              >
                <div className="text-base mb-1">{card.icon}</div>
                <div className="text-xs font-semibold text-gray-200 group-hover:text-indigo-300 transition">
                  {card.title}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">{card.desc}</div>
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>


      {/* Error Alert Card */}
      {(externalErrorMsg || errorMsg) && (
        <div className="mx-4 mb-3 p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-200 text-xs flex items-start justify-between gap-3 shadow-lg backdrop-blur-md">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-300 mb-0.5">Generation Failed</div>
              <p className="text-gray-300 leading-relaxed font-mono text-[11px] bg-rose-900/30 p-2 rounded-lg border border-rose-500/20 my-1.5">
                {externalErrorMsg || errorMsg}
              </p>
              <div className="text-[11px] text-gray-400">
                💡 <span className="font-semibold text-gray-300">Tip:</span> Try selecting a different model from the dropdown above (e.g. <span className="text-indigo-300 font-mono">Ling 3.0 Flash ⚡</span> or <span className="text-indigo-300 font-mono">GPT-4o</span>).
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setErrorMsg(null);
              if (onDismissError) onDismissError();
            }}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-[11px] border border-rose-500/30 transition shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}


      {/* Footer Input Area */}
      <div className="p-4 border-t border-border bg-surface/50">
        <div className="relative flex items-center rounded-xl bg-surface border border-border focus-within:border-indigo-500/80 transition shadow-inner">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your knowledge base documents... (Shift+Enter for new line)"
            disabled={isGenerating}
            rows={2}
            className="w-full px-4 py-3 bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none resize-none"
          />

          <div className="flex items-center gap-2 pr-3">
            {isGenerating && onStopGeneration ? (
              <button
                onClick={onStopGeneration}
                title="Stop Generation"
                className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 text-xs shadow-md shadow-rose-600/30 cursor-pointer animate-pulse transition shrink-0"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className={`p-2.5 rounded-lg transition flex items-center justify-center ${
                  input.trim() && !isGenerating
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer'
                    : 'bg-border/50 text-gray-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
