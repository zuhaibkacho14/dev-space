import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Plus,
  Moon,
  Sun,
  Timer,
  Pause,
  Play,
  RotateCcw,
  CheckSquare,
  FolderKanban,
  Code2,
  FileText,
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface HeaderProps {
  onQuickCreateTask: () => void;
  onQuickCreateProject: () => void;
  onQuickCreateSnippet: () => void;
  onQuickCreateNote: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onQuickCreateTask,
  onQuickCreateProject,
  onQuickCreateSnippet,
  onQuickCreateNote,
}) => {
  const { currentTab, setCurrentTab, data, updateSettings, timerState, pauseTimer, resumeTimer, resetTimer } =
    useWorkspace();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const getTabTitle = (tab: NavigationTab): { title: string; subtitle: string } => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of your productivity, deadlines, and active projects.' };
      case 'projects':
        return { title: 'Project Management', subtitle: 'Track roadmaps, calculate real task velocity, and view milestones.' };
      case 'tasks':
        return { title: 'Task Manager', subtitle: 'Kanban board and list view with priority scheduling and deadlines.' };
      case 'snippets':
        return { title: 'Code Snippets', subtitle: 'Searchable developer code library with syntax highlighting.' };
      case 'notes':
        return { title: 'Developer Notes', subtitle: 'Autosaving technical documentation, checklists, and scratchpad.' };
      case 'bookmarks':
        return { title: 'Developer Bookmarks', subtitle: 'Verified documentation, repos, and developer tooling links.' };
      case 'focus':
        return { title: 'Focus Timer', subtitle: 'Pomodoro intervals with project tracking and background time reconciliation.' };
      case 'analytics':
        return { title: 'Productivity Analytics', subtitle: 'Real-time metrics, completion velocities, and focus distribution.' };
      case 'settings':
        return { title: 'Settings & Data', subtitle: 'Appearance, storage status, JSON schema import/export, and preferences.' };
    }
  };

  const { title, subtitle } = getTabTitle(currentTab);

  // Format timer countdown
  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTheme = () => {
    const next = data.settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: next });
  };

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Title & Subtitle */}
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate">
          {title}
        </h1>
        <p className="text-[11px] text-slate-400 hidden lg:block truncate">{subtitle}</p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mini Pomodoro Status Pill if running or paused */}
        {timerState.status !== 'idle' && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200">
            <button
              onClick={() => setCurrentTab('focus')}
              className="flex items-center gap-1.5 hover:text-indigo-400 transition"
              title="View Focus Timer"
            >
              <Timer className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="font-mono font-semibold">
                {formatTimerTime(timerState.remainingSeconds)}
              </span>
            </button>
            <div className="h-3 w-px bg-slate-700" />
            {timerState.status === 'running' ? (
              <button
                onClick={pauseTimer}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition"
                title="Pause"
              >
                <Pause className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded transition"
                title="Resume"
              >
                <Play className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={resetTimer}
              className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition"
              title="Reset"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Quick Create Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-900/30 transition hover:-translate-y-0.5 active:translate-y-0"
            aria-expanded={quickCreateOpen}
            aria-haspopup="menu"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>

          {quickCreateOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setQuickCreateOpen(false)}
                aria-hidden="true"
              />
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1.5 z-40 text-xs animate-in fade-in zoom-in-95"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setQuickCreateOpen(false);
                    onQuickCreateTask();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-white text-left transition"
                >
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>Create Task</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setQuickCreateOpen(false);
                    onQuickCreateProject();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-white text-left transition"
                >
                  <FolderKanban className="w-4 h-4 text-indigo-400" />
                  <span>New Project</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setQuickCreateOpen(false);
                    onQuickCreateSnippet();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-white text-left transition"
                >
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span>Add Code Snippet</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setQuickCreateOpen(false);
                    onQuickCreateNote();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-white text-left transition"
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>New Note</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          aria-label={`Toggle theme. Current theme is ${data.settings.theme}`}
          title={`Switch to ${data.settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {data.settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </div>
    </header>
  );
};
