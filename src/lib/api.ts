const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  isFree?: boolean;
}

export interface ModelDiscoveryResponse {
  chatModels: ModelOption[];
  embeddingModels: ModelOption[];
}

export interface IngestParams {
  text?: string;
  source: string;
  title?: string;
  format?: 'markdown' | 'text' | 'pdf';
  embeddingModel?: string;
  pdfBase64?: string;
}

export interface IngestResponse {
  success: boolean;
  documentId: string;
  title: string;
  chunksIngested: number;
  embeddingModel: string;
}

export interface IngestedDocInfo {
  id: string;
  title: string;
  source: string;
  format: string;
  chunksCount: number;
  ingestedAt: string;
  summarySnippet?: string;
}

export interface DocumentsResponse {
  indexes: string[];
  activeIndex: string;
  provider: string;
}

export async function fetchIngestedDocumentsList(): Promise<IngestedDocInfo[]> {
  const res = await fetch(`${API_BASE_URL}/documents/list`);
  if (!res.ok) throw new Error('Failed to fetch ingested documents list');
  const data = await res.json();
  return data.documents || [];
}


export async function fetchLiveModels(): Promise<ModelDiscoveryResponse> {
  const res = await fetch(`${API_BASE_URL}/models`);
  if (!res.ok) throw new Error('Failed to fetch live models');
  return res.json();
}

export async function ingestDocument(params: IngestParams): Promise<IngestResponse> {
  const res = await fetch(`${API_BASE_URL}/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Ingestion failed');
  }
  return res.json();
}

export async function fetchDocuments(): Promise<DocumentsResponse> {
  const res = await fetch(`${API_BASE_URL}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export interface ChatThreadItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatThreadDetail {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageItem[];
}

export async function fetchChatThreads(): Promise<ChatThreadItem[]> {
  const res = await fetch(`${API_BASE_URL}/chat/threads`);
  if (!res.ok) throw new Error('Failed to fetch chat threads');
  const data = await res.json();
  return data.threads || [];
}

export async function fetchThreadDetail(threadId: string): Promise<ChatThreadDetail> {
  const res = await fetch(`${API_BASE_URL}/chat/threads/${threadId}`);
  if (!res.ok) throw new Error('Failed to fetch thread detail');
  return res.json();
}

export async function createChatThread(title?: string): Promise<ChatThreadDetail> {
  const res = await fetch(`${API_BASE_URL}/chat/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create chat thread');
  return res.json();
}

export async function deleteChatThread(threadId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/chat/threads/${threadId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete chat thread');
  const data = await res.json();
  return data.success;
}

export async function streamChatResponse(
  messages: Array<{ role: string; content: string }>,
  chatModel: string,
  threadId: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (err: string) => void,
  signal?: AbortSignal
) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, chatModel, threadId }),
      signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Stream request failed' }));
      onError(err.error || 'Chat stream failed');
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError('Readable stream not supported');
      return;
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      if (signal?.aborted) {
        onComplete();
        return;
      }
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const payload = line.replace('data: ', '').trim();
          if (payload === '[DONE]') {
            onComplete();
            return;
          }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.content) {
              onChunk(parsed.content);
            } else if (parsed.error) {
              onError(parsed.error);
            }
          } catch {
            // Ignore parse errors for partial chunks
          }
        }
      }
    }
    onComplete();
  } catch (err: any) {
    if (err.name === 'AbortError' || signal?.aborted) {
      onComplete();
    } else {
      onError(err.message || 'Stream error');
    }
  }
}

