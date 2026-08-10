import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mastra RAG Studio | 2-Repo Architecture",
  description: "AI-Powered RAG System with Mastra AI Node.js Backend and Next.js Frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
