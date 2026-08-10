'use client';

import React from 'react';
import {
  MessageSquare,
  BookOpen,
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';
import { ChatThreadItem } from '@/lib/api';

interface SidebarNavProps {
  activeView: 'chat' | 'knowledge';
  onSelectView: (view: 'chat' | 'knowledge') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  docsCount: number;
  threads?: ChatThreadItem[];
  activeThreadId?: string;
  generatingThreadId?: string;
  onSelectThread?: (threadId: string) => void;
  onNewChat?: () => void;
  onDeleteThread?: (threadId: string) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  docsCount,
  threads = [],
  activeThreadId,
  generatingThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
}) => {

  return (
    <aside
      className={`glass-panel h-full border-r border-border transition-all duration-300 flex flex-col justify-between shrink-0 overflow-hidden ${
        isCollapsed ? 'w-16 p-2' : 'w-64 p-4'
      }`}
    >
      {/* Top Section */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header & Collapse Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-100 tracking-wide">
                Knowledge AI
              </span>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition mx-auto cursor-pointer"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-indigo-400" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 shrink-0">
          {/* Knowledge Base Hub */}
          <button
            onClick={() => onSelectView('knowledge')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeView === 'knowledge'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-surface'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Knowledge Base"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Knowledge Base</span>}
            </div>

            {!isCollapsed && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  activeView === 'knowledge'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                }`}
              >
                {docsCount} Docs
              </span>
            )}
          </button>

          {/* Chat Assistant */}
          <button
            onClick={() => onSelectView('chat')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeView === 'chat'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-surface'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title="Chat Assistant"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Chat Assistant</span>}
            </div>
          </button>
        </nav>

        {/* Recent Conversations List (Visible when Chat is active or expanded) */}
        {!isCollapsed && activeView === 'chat' && (
          <div className="mt-4 pt-3 border-t border-border/80 flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* New Chat Button */}
            {onNewChat && (
              <button
                onClick={onNewChat}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-indigo-300 hover:text-white transition cursor-pointer mb-3 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            )}

            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-1 shrink-0">
              Recent Chats
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {threads.length > 0 ? (
                threads.map((thread) => {
                  const isActive = activeThreadId === thread.id;
                  const isGeneratingThis = generatingThreadId === thread.id;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => onSelectThread && onSelectThread(thread.id)}
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition cursor-pointer ${
                        isActive
                          ? 'bg-surface-hover text-indigo-300 font-semibold border border-indigo-500/40'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-surface/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isGeneratingThis ? (
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400 animate-pulse" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 text-gray-500 group-hover:text-indigo-400" />
                        )}
                        <span className="truncate text-xs">{thread.title}</span>
                      </div>


                      {/* Delete Icon on Sidebar Thread Item */}
                      {onDeleteThread && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteThread(thread.id);
                          }}
                          title="Delete Chat Thread"
                          className="p-1 rounded-md text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-[11px] text-gray-500 py-4 text-center italic">
                  No previous chats yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

