import React from 'react';
import { WorkspaceData } from '../../types';
import { Modal } from '../common/Modal';
import {
  AlertTriangle,
  FolderGit2,
  CheckSquare,
  Code2,
  FileText,
  Bookmark as BookmarkIcon,
  Timer,
  ArrowRight,
} from 'lucide-react';

interface ImportSummary {
  projectsCount: number;
  tasksCount: number;
  snippetsCount: number;
  notesCount: number;
  bookmarksCount: number;
  sessionsCount: number;
}

interface ImportDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  incomingData: WorkspaceData;
  currentData: WorkspaceData;
  summary: ImportSummary;
}

export const ImportDiffModal: React.FC<ImportDiffModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentData,
  summary,
}) => {
  const diffItems = [
    {
      label: 'Projects',
      icon: FolderGit2,
      current: currentData.projects.length,
      incoming: summary.projectsCount,
    },
    {
      label: 'Tasks',
      icon: CheckSquare,
      current: currentData.tasks.length,
      incoming: summary.tasksCount,
    },
    {
      label: 'Code Snippets',
      icon: Code2,
      current: currentData.snippets.length,
      incoming: summary.snippetsCount,
    },
    {
      label: 'Developer Notes',
      icon: FileText,
      current: currentData.notes.length,
      incoming: summary.notesCount,
    },
    {
      label: 'Bookmarks',
      icon: BookmarkIcon,
      current: currentData.bookmarks.length,
      incoming: summary.bookmarksCount,
    },
    {
      label: 'Focus Sessions',
      icon: Timer,
      current: currentData.focusSessions.length,
      incoming: summary.sessionsCount,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Workspace Import"
      description="Review the contents of the imported backup before applying changes."
    >
      <div className="space-y-4">
        {/* Warning callout */}
        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Important:</strong> Importing will replace your current workspace records with the
            data from this backup file. Ensure you have exported a copy of your existing workspace if needed.
          </div>
        </div>

        {/* Diff Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          <div className="grid grid-cols-12 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span className="col-span-6">Collection</span>
            <span className="col-span-3 text-right">Current</span>
            <span className="col-span-3 text-right text-indigo-600 dark:text-indigo-400">Incoming</span>
          </div>

          {diffItems.map((item) => {
            const Icon = item.icon;
            const diff = item.incoming - item.current;

            return (
              <div
                key={item.label}
                className="grid grid-cols-12 items-center px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300"
              >
                <div className="col-span-6 flex items-center gap-2 font-medium">
                  <Icon className="w-4 h-4 text-slate-400" />
                  {item.label}
                </div>
                <div className="col-span-3 text-right font-mono text-slate-500">
                  {item.current}
                </div>
                <div className="col-span-3 text-right font-mono font-semibold flex items-center justify-end gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                  {item.incoming}
                  <span
                    className={`text-[10px] ${
                      diff > 0
                        ? 'text-emerald-500'
                        : diff < 0
                        ? 'text-rose-500'
                        : 'text-slate-400'
                    }`}
                  >
                    ({diff >= 0 ? `+${diff}` : diff})
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
          >
            Apply Import
          </button>
        </div>
      </div>
    </Modal>
  );
};
