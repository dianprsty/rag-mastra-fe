# 🎨 Mastra RAG Frontend (`rag-frontend`)

A modern, high-performance web application built with **Next.js 14+ App Router**, **React**, and **Tailwind CSS** for interacting with the **Mastra RAG Backend**.

It features dynamic OpenRouter LLM model selection inside the chat workspace, persistent multi-thread background streaming, stop-generation stream control, interactive citation drawers (`[1]`, `[2]`), a minimizable navigation sidebar, a unified Knowledge Base Hub, and a sleek dark-mode glassmorphism Mastra Zinc design.

---

## 📋 Prerequisites

* **Node.js**: `v22.x+` (**Minimum required: Node 22.0.0+**)
* **npm**: `v10.x+`
* **Running Backend**: The `rag-backend` server running on **`http://localhost:4000`**.


---

## ✨ Features & Capabilities

* **💬 Persistent Chat History Threads**:
  * Create, switch, and manage multiple chat conversations.
  * Auto-titles threads based on your initial prompt.
  * Delete threads directly from sidebar items using the trash `🗑️` icon.
* **🔄 Persistent Multi-Thread Background Streaming**:
  * Responses continue streaming in the background even if you switch menus (e.g. from **Chat Assistant** to **Knowledge Base**) or switch between sidebar chat threads (`threadMessagesMap`).
  * Animated pulsing `✨` badge indicates active background generation.
* **🛑 Stop Generation Stream Control**:
  * Send button transforms into a red **Stop Generation** button (`Square` icon) during active streaming.
  * Clicking **Stop** immediately cancels the stream via `AbortController` and preserves partial text.
* **🚨 Model Generation Error Handling**:
  * Actionable error cards with `AlertCircle`, exact traceback text, and model switching hints if a model encounters rate limits or errors.
* **🤖 Integrated Chat Box Model Selector**:
  * Switch LLM chat models (`Ling 3.0 Flash ⚡ Free`, `GPT-4o`, `Claude 3.5 Sonnet`, `Gemini 2.0 Flash`, `DeepSeek R1`) directly inside the chat workspace header.
* **📚 Grouped Knowledge Base Hub**:
  * Consolidated view combining document library listing, complete preview card with chunk count, format, timestamp, and text excerpt.
* **📖 Interactive "How to Use" Guide Carousel**:
  * 3-step slide-over carousel guide triggered via the top-right header `? How to Use` button.
* **📌 Interactive Inline Citations (`[1]`, `[2]`)**:
  * Clickable citation tags open a side drawer highlighting exact text passages, source titles, and chunk IDs.

---

## ⚙️ Environment Variables

Create `.env.local` in the root of `rag-frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 📦 Installation & Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd rag-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Next.js Development Server**:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:3000`** in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🎯 How to Use the App

### 1. Navigating the Workspace
* Use the left minimizable sidebar to switch between:
  * 💬 **Chat Assistant**: AI Q&A workspace with active threads.
  * 📚 **Knowledge Base**: Grouped document library, previews, and upload actions.
* Click the collapse toggle at the top of the sidebar to maximize chat space.

### 2. Managing Chat Threads & History
* Click **`+ New Chat`** in the sidebar to start a new discussion.
* Click any past thread item to switch conversations without losing stream progress.
* Hover over a sidebar thread item and click `🗑️` to delete that chat history.

### 3. Selecting an AI Model & Chatting
* Inside the **Chat Assistant** header bar, use the **Model** dropdown menu to select your LLM model.
* Type your question in the chat input box at the bottom.
* To cancel a long response, click the red **Stop** button.
* Click amber citation badges like **`[1]`** to open the **Citation Drawer** on the right.

### 4. Uploading Documents to the Knowledge Base
* In the **Knowledge Base** menu, click **`+ Add Document`**.
* Choose your upload tab:
  * **Raw Text**: Paste text articles or meeting notes.
  * **Upload File**: Select `.pdf`, `.md`, or `.txt` files.
  * **Web URL**: Ingest web page articles.
* Click **Start Ingestion** to process document chunks into vector embeddings.

---

## 📁 Project Structure

```
rag-frontend/
├── src/
│   ├── app/
│   │   ├── globals.css                # Mastra Zinc dark theme & glassmorphism system
│   │   ├── layout.tsx                 # Root HTML & metadata
│   │   └── page.tsx                   # Main workspace & per-thread stream controller
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx      # Chat workspace, header model selector & stop button
│   │   │   └── CitationDrawer.tsx     # Fact source citation drawer
│   │   ├── documents/
│   │   │   ├── DocumentIngestModal.tsx# Multi-tab ingestion modal
│   │   │   └── KnowledgeBaseHub.tsx   # Grouped document library & preview hub
│   │   └── layout/
│   │       ├── Header.tsx             # Main header with top-right How to Use button
│   │       ├── HowToUseSliderModal.tsx# 3-step carousel guide drawer
│   │       └── SidebarNav.tsx         # Minimizable sidebar nav & recent chat threads
│   └── lib/
│       └── api.ts                     # API service client for rag-backend
├── .env.local
├── package.json
└── tailwind.config.ts
```
