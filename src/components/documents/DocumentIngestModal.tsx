'use client';

import React, { useState } from 'react';
import { X, FileText, Upload, Link, Cpu, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ingestDocument, ModelOption } from '@/lib/api';

interface DocumentIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  embeddingModels: ModelOption[];
  onIngestSuccess: () => void;
}

export const DocumentIngestModal: React.FC<DocumentIngestModalProps> = ({
  isOpen,
  onClose,
  embeddingModels,
  onIngestSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'url'>('file');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [format, setFormat] = useState<'text' | 'markdown' | 'pdf'>('text');
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState<string>(
    embeddingModels[0]?.id || 'openrouter/text-embedding-3-small'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    let contentToIngest = text;
    let sourceId = source.trim() || title.trim() || `doc-${Date.now()}`;

    if (activeTab === 'url') {
      if (!url.trim()) {
        setStatusMsg({ type: 'error', text: 'Please enter a valid URL' });
        return;
      }
      contentToIngest = `Document content ingested from URL: ${url}`;
      sourceId = url;
    }

    if (!contentToIngest.trim() && !pdfBase64) {
      setStatusMsg({ type: 'error', text: 'Please select a file or provide text to ingest' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await ingestDocument({
        text: contentToIngest,
        source: sourceId,
        title: title || sourceId,
        format,
        embeddingModel: selectedEmbeddingModel,
        pdfBase64: format === 'pdf' ? pdfBase64 : undefined,
      });

      setStatusMsg({
        type: 'success',
        text: `Successfully ingested document! ${res.chunksIngested} chunks created.`,
      });

      setText('');
      setTitle('');
      setSource('');
      setUrl('');
      setPdfBase64('');
      onIngestSuccess();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Ingestion failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileTitle = file.name.replace(/\.[^/.]+$/, '');
    setTitle(fileTitle);
    setSource(file.name);
    setPdfBase64('');

    if (file.name.endsWith('.pdf')) {
      setFormat('pdf');
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64Str = result.split(',')[1];
        setPdfBase64(base64Str);
      };
      reader.readAsDataURL(file);
    } else if (file.name.endsWith('.md')) {
      setFormat('markdown');
      const reader = new FileReader();
      reader.onload = (event) => {
        setText((event.target?.result as string) || '');
      };
      reader.readAsText(file);
    } else {
      setFormat('text');
      const reader = new FileReader();
      reader.onload = (event) => {
        setText((event.target?.result as string) || '');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/80">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-gray-100">Add Document to Knowledge Base</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-surface/30">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'file'
                ? 'border-indigo-500 text-indigo-400 bg-surface'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'text'
                ? 'border-indigo-500 text-indigo-400 bg-surface'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Text</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'url'
                ? 'border-indigo-500 text-indigo-400 bg-surface'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Web URL</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title & Source Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Document Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Product Guide 2026"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">File Name (Optional)</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. guide-v1.pdf"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tab: Upload File */}
          {activeTab === 'file' && (
            <div className="border-2 border-dashed border-border hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition bg-surface/30">
              <input
                type="file"
                accept=".pdf,.txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-200">Click to select PDF, Markdown, or Text file</p>
                <p className="text-[11px] text-gray-400 mt-1">Supports PDF (.pdf), Markdown (.md), and Text (.txt)</p>
              </label>
              {(pdfBase64 || text) && (
                <div className="mt-3 text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    ✓ File ready ({pdfBase64 ? 'PDF Document Loaded' : `${text.length} characters`})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tab: Text */}
          {activeTab === 'text' && (
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Document Content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Paste your text content or article notes here..."
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-gray-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
              />
            </div>
          )}

          {/* Tab: URL */}
          {activeTab === 'url' && (
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">Target Document URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/document.pdf"
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Status Alert */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Document...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Document</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
