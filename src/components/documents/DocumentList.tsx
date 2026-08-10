'use client';

import React from 'react';
import { Database, Layers, CheckCircle } from 'lucide-react';
import { DocumentsResponse } from '@/lib/api';

interface DocumentListProps {
  documentsInfo: DocumentsResponse | null;
  isLoading: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documentsInfo, isLoading }) => {
  return (
    <div className="glass-panel rounded-2xl border border-border p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Knowledge Library</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
          Connected & Ready
        </span>
      </div>

      {isLoading ? (
        <div className="text-xs text-gray-500 py-4 text-center">Loading knowledge status...</div>
      ) : documentsInfo ? (
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs font-semibold text-gray-200">Ingested Documents Store</p>
                <p className="text-[10px] text-emerald-400 font-medium">Ready for Search & Q&A</p>
              </div>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-500 py-4 text-center">Library status unavailable.</div>
      )}
    </div>
  );
};

