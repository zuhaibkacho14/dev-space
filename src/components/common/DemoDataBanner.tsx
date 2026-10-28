import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Sparkles, Trash2, X } from 'lucide-react';

export const DemoDataBanner: React.FC = () => {
  const { data, clearDemoData } = useWorkspace();
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (!data.isDemoData || isDismissed) return null;

  return (
    <div
      role="banner"
      className="bg-indigo-950/70 border-b border-indigo-800/40 px-4 py-2 text-xs text-indigo-200 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="font-medium text-slate-200">Demo Data Active:</span>
        <span className="text-indigo-300/90 truncate">
          Loaded sample projects, tasks, snippets, and notes for demonstration.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={clearDemoData}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition shadow-xs"
        >
          <Trash2 className="w-3 h-3" />
          Clear Demo Data
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded text-indigo-400 hover:text-indigo-200 transition"
          aria-label="Dismiss demo banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
