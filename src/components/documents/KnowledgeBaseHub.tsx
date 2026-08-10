'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Layers,
  PlusCircle,
  CheckCircle2,
  Calendar,
  FileCode,
  Eye,
  ChevronRight,
  Database,
} from 'lucide-react';
import { IngestedDocInfo } from '@/lib/api';

interface KnowledgeBaseHubProps {
  documents: IngestedDocInfo[];
  isLoading: boolean;
  onOpenUploadModal: () => void;
}

export const KnowledgeBaseHub: React.FC<KnowledgeBaseHubProps> = ({
  documents,
  isLoading,
  onOpenUploadModal,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<IngestedDocInfo | null>(
    documents[0] || null
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-w-0 overflow-hidden">
      {/* Left Column: Documents List & Actions */}
      <div className="w-full lg:w-96 flex flex-col h-full glass-panel rounded-2xl border border-border shadow-xl p-5 shrink-0 overflow-hidden">
        {/* Hub Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100">Knowledge Library</h2>
              <p className="text-[11px] text-gray-400">
                {documents.length} Ingested Documents
              </p>
            </div>
          </div>

          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Document</span>
          </button>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {isLoading ? (
            <div className="text-xs text-gray-500 py-10 text-center animate-pulse">
              Loading knowledge library documents...
            </div>
          ) : documents.length > 0 ? (
            documents.map((doc) => {
              const isSelected = (selectedDoc?.id || selectedDoc?.source) === (doc.id || doc.source);
              return (
                <div
                  key={doc.id || doc.source}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/80 shadow-md'
                      : 'bg-surface/60 border-border hover:border-gray-700 hover:bg-surface'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {doc.format === 'pdf' ? (
                        <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                      <h3 className="text-xs font-bold text-gray-200 truncate">
                        {doc.title}
                      </h3>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="font-mono truncate max-w-[160px] text-gray-500">
                      {doc.source}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-hover border border-border text-indigo-300 font-semibold">
                      {doc.chunksCount} Chunks
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-gray-500 py-10 text-center">
              No documents ingested yet. Click "+ Add Document" to add one!
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Selected Document Details & Content Preview */}
      <div className="flex-1 flex flex-col h-full glass-panel rounded-2xl border border-border shadow-xl p-6 overflow-hidden">
        {selectedDoc ? (
          <div className="flex flex-col h-full space-y-6 overflow-y-auto">
            {/* Header & Meta */}
            <div className="pb-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Active & Indexed
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {selectedDoc.format.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-100">{selectedDoc.title}</h2>
                <p className="text-xs font-mono text-gray-400 mt-0.5">Source: {selectedDoc.source}</p>
              </div>

            </div>



            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Total Chunks</span>
                </div>
                <p className="text-base font-bold text-indigo-300">
                  {selectedDoc.chunksCount} Chunks
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vector Dimension</span>
                </div>
                <p className="text-base font-bold text-emerald-300">1536d Standard</p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ingestion Date</span>
                </div>
                <p className="text-xs font-semibold text-gray-200 mt-1">
                  {new Date(selectedDoc.ingestedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Document Content Excerpt / Summary */}
            <div className="flex-1 flex flex-col min-h-[220px]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Document Excerpt & Summary</span>
              </div>

              <div className="flex-1 p-4 rounded-xl bg-surface/70 border border-border text-xs leading-relaxed text-gray-300 overflow-y-auto font-mono whitespace-pre-wrap">
                {selectedDoc.summarySnippet ||
                  `Document content successfully processed into ${selectedDoc.chunksCount} vector embeddings and indexed in LibSQL database.`}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
            <BookOpen className="w-12 h-12 mb-3 text-gray-600" />
            <p className="text-sm font-semibold">Select a document from the left list to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
};
