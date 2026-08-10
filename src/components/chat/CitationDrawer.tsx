'use client';

import React from 'react';
import { X, BookOpen, Quote, Hash } from 'lucide-react';

export interface CitationDetail {
  number: string;
  title: string;
  source: string;
  chunkIndex?: number;
  quote: string;
}

interface CitationDrawerProps {
  citation: CitationDetail | null;
  onClose: () => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md glass-panel border-l border-border p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
      <div>
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              [{citation.number}]
            </div>
            <h3 className="font-semibold text-gray-200 text-sm">Document Citation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-surface-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Document Details */}
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Document Title</span>
            </div>
            <p className="text-sm font-semibold text-gray-100">{citation.title}</p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-xl bg-surface border border-border">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                <span>Source File</span>
              </div>
              <p className="text-xs text-gray-300 font-mono truncate">{citation.source}</p>
            </div>

            {citation.chunkIndex !== undefined && (
              <div className="w-28 p-3 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-1 text-xs text-gray-400 font-medium mb-1">
                  <Hash className="w-3.5 h-3.5" />
                  <span>Section</span>
                </div>
                <p className="text-xs text-indigo-300 font-semibold">#{citation.chunkIndex + 1}</p>
              </div>
            )}
          </div>

          {/* Exact Quote */}
          <div className="p-4 rounded-xl bg-surface/80 border border-border/80">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-2">
              <Quote className="w-3.5 h-3.5" />
              <span>Document Quote</span>
            </div>
            <blockquote className="text-xs leading-relaxed text-gray-300 italic border-l-2 border-amber-400/50 pl-3 py-1">
              "{citation.quote}"
            </blockquote>
          </div>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="pt-4 border-t border-border flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-medium bg-surface-hover hover:bg-border text-gray-300 rounded-lg transition"
        >
          Close
        </button>
      </div>

    </div>
  );
};
