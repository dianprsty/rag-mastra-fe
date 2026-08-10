import { Sparkles, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenHowToUse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHowToUse }) => {
  return (
    <header className="w-full glass-panel sticky top-0 z-40 border-b border-border px-4 py-3 flex items-center justify-between shadow-lg">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-100 flex items-center gap-2">
            Knowledge Assistant
          </h1>
          <p className="text-xs text-gray-400">AI-Powered Document Search & Q&A</p>
        </div>
      </div>

      {/* Top Right How to Use Button */}
      {onOpenHowToUse && (
        <button
          onClick={onOpenHowToUse}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-semibold text-gray-300 hover:text-white transition shadow-sm cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>How to Use</span>
        </button>
      )}
    </header>
  );
};



