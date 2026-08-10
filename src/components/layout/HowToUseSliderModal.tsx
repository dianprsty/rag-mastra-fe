'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, MessageSquare, CheckCircle2 } from 'lucide-react';

interface HowToUseSliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload: () => void;
}

export const HowToUseSliderModal: React.FC<HowToUseSliderModalProps> = ({
  isOpen,
  onClose,
  onOpenUpload,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      stepNum: 1,
      badge: 'Step 1 of 3',
      title: 'Upload Your Knowledge Documents',
      subtitle: 'Add your PDFs, Markdown files, or plain text notes to your personal library.',
      icon: <Upload className="w-8 h-8 text-indigo-400" />,
      features: [
        'Supports PDF books, research papers, and technical specs.',
        'Drag & drop files or paste raw text articles.',
        'Automatic 512-token chunking with 1536d vector embedding.',
      ],
      actionLabel: '+ Add Document',

      onAction: () => {
        onClose();
        onOpenUpload();
      },
    },
    {
      stepNum: 2,
      badge: 'Step 2 of 3',
      title: 'Ask Questions & Generate Quizzes',
      subtitle: 'Query your knowledge base using state-of-the-art AI models.',
      icon: <MessageSquare className="w-8 h-8 text-emerald-400" />,
      features: [
        'Ask open-ended questions grounded directly in your files.',
        'Click quick action cards to generate 5-question quizzes.',
        'Real-time streaming answers powered by OpenRouter models.',
      ],
    },
    {
      stepNum: 3,
      badge: 'Step 3 of 3',
      title: 'Verify Facts with Inline Citations',
      subtitle: 'Every claim is backed by exact quotes from your uploaded documents.',
      icon: <CheckCircle2 className="w-8 h-8 text-amber-400" />,
      features: [
        'Clickable bracketed tags like [1] inline in answer text.',
        'Slide-out Citation Drawer showing exact source file and section.',
        'Zero hallucination guarantee with factual grounding.',
      ],
    },
  ];

  const slide = slides[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Interactive Guide
            </span>
            <h2 className="text-sm font-bold text-gray-100">How to Use Knowledge AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel Content Slide */}
        <div className="p-6 space-y-6 min-h-[300px] flex flex-col justify-center">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-surface border border-border shadow-inner shrink-0">
              {slide.icon}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                {slide.badge}
              </span>
              <h3 className="text-base font-bold text-gray-100 mt-0.5">{slide.title}</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{slide.subtitle}</p>
            </div>
          </div>

          {/* Key Bullet Features */}
          <div className="p-4 rounded-xl bg-surface/60 border border-border space-y-2">
            {slide.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {slide.actionLabel && slide.onAction && (
            <button
              onClick={slide.onAction}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30"
            >
              {slide.actionLabel}
            </button>
          )}
        </div>

        {/* Carousel Slider Controls */}
        <div className="px-6 py-4 border-t border-border bg-surface/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentStep === idx ? 'w-6 bg-indigo-500' : 'w-2 bg-border hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-border text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < slides.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(slides.length - 1, prev + 1))}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1 shadow-md shadow-indigo-600/30"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-md shadow-emerald-600/30"
              >
                <span>Got It!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
