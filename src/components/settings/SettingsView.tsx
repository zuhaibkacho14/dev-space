import React, { useState, useRef, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ThemePreference, WeekStartsOn, WorkspaceData } from '../../types';
import {
  exportWorkspaceJson,
  validateImportJson,
  calculateStorageUsage,
} from '../../services/storage';
import { ImportDiffModal } from './ImportDiffModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Calendar,
  Timer,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Volume2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    data,
    updateSettings,
    updatePomodoroSettings,
    clearDemoData,
    resetDemoData,
    replaceWorkspaceData,
    showToast,
  } = useWorkspace();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [importSummary, setImportSummary] = useState<{
    summary: {
      projectsCount: number;
      tasksCount: number;
      snippetsCount: number;
      notesCount: number;
      bookmarksCount: number;
      sessionsCount: number;
    };
    parsedData: WorkspaceData;
  } | null>(null);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Storage calculation
  const storage = useMemo(() => calculateStorageUsage(), [data]);

  const handleExport = () => {
    try {
      const jsonStr = exportWorkspaceJson(data);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `devflow-workspace-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Export Complete', 'Workspace backup saved to disk', 'success');
    } catch {
      showToast('Export Error', 'Failed to generate JSON backup', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateImportJson(content);

      if (!result.isValid || !result.parsedData || !result.summary) {
        showToast(
          'Import Rejected',
          result.errors.length > 0 ? result.errors[0] : 'Invalid DevFlow schema',
          'error'
        );
        return;
      }

      setImportSummary({
        summary: result.summary,
        parsedData: result.parsedData,
      });
    };

    reader.onerror = () => {
      showToast('File Error', 'Could not read chosen file', 'error');
    };

    reader.readAsText(file);

    // Reset input value so user can upload the same file again if desired
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (importSummary) {
      replaceWorkspaceData(importSummary.parsedData);
      setImportSummary(null);
      showToast('Workspace Restored', 'Successfully imported all items', 'success');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-500" />
          Settings & Data Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure appearance, Pomodoro intervals, and manage client-side storage backups.
        </p>
      </div>

      {/* Appearance Section */}
      <div className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <Sun className="w-4 h-4 text-indigo-500" />
          Theme & Display
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Choose your visual preference. Defaults to charcoal dark mode inspired by developer tools.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Charcoal & Slate' },
            { id: 'light', label: 'Light Mode', icon: Sun, desc: 'High contrast clean' },
            { id: 'system', label: 'System Default', icon: Monitor, desc: 'Matches OS theme' },
          ].map((theme) => {
            const Icon = theme.icon;
            const isSelected = data.settings.theme === theme.id;

            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => updateSettings({ theme: theme.id as ThemePreference })}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/50'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {theme.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{theme.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Week Start */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Calendar Week Start
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Set the starting day for deadline and schedule visualizations.
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => updateSettings({ weekStartsOn: 'monday' })}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                data.settings.weekStartsOn === 'monday'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Monday
            </button>
            <button
              onClick={() => updateSettings({ weekStartsOn: 'sunday' })}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                data.settings.weekStartsOn === 'sunday'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Sunday
            </button>
          </div>
        </div>
      </div>

      {/* Focus Timer Configuration */}
      <div className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <Timer className="w-4 h-4 text-indigo-500" />
          Pomodoro & Focus Timer Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Customize duration intervals (in minutes) for deep focus blocks and recovery breaks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Focus Duration
            </label>
            <select
              value={data.settings.pomodoro.focusDuration}
              onChange={(e) => updatePomodoroSettings({ focusDuration: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              {[15, 20, 25, 30, 45, 50, 60].map((mins) => (
                <option key={mins} value={mins}>
                  {mins} minutes
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Short Break
            </label>
            <select
              value={data.settings.pomodoro.shortBreak}
              onChange={(e) => updatePomodoroSettings({ shortBreak: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              {[3, 5, 10, 15].map((mins) => (
                <option key={mins} value={mins}>
                  {mins} minutes
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Long Break
            </label>
            <select
              value={data.settings.pomodoro.longBreak}
              onChange={(e) => updatePomodoroSettings({ longBreak: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              {[10, 15, 20, 30].map((mins) => (
                <option key={mins} value={mins}>
                  {mins} minutes
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-slate-400" />
              Completion Chime Sound
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Plays a gentle harmonic chime via Web Audio API when a timer finishes.
            </div>
          </div>
          <button
            onClick={() =>
              updatePomodoroSettings({
                soundEnabled: !data.settings.pomodoro.soundEnabled,
              })
            }
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              data.settings.pomodoro.soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            role="switch"
            aria-checked={data.settings.pomodoro.soundEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                data.settings.pomodoro.soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Storage & Backup Management */}
      <div className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-500" />
          Client Storage & Workspace Data
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          DevFlow is an offline-first workspace. All your records are securely stored in your browser
          without sending sensitive code or notes to remote servers.
        </p>

        {/* Storage Bar */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Browser LocalStorage Usage
            </span>
            <span className="font-mono text-slate-500">
              {storage.usedKb} KB utilized (~{storage.percentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(storage.percentage, 1)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Storage holds {data.projects.length} projects, {data.tasks.length} tasks, {data.snippets.length} snippets, {data.notes.length} notes, and {data.bookmarks.length} bookmarks.
          </p>
        </div>

        {/* Backup and Restore Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-500" />
                Export Workspace
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Download a complete, portable JSON backup of your projects, tasks, snippets, notes, and focus history.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Backup JSON
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-500" />
                Import Workspace
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Restore workspace data from a JSON file. Includes schema verification and diff preview.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Select File to Import...
            </button>
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-750 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Demo Data & Workspace Reset
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {data.isDemoData
                ? 'Your workspace currently contains sample developer records.'
                : 'Demo data has been cleared. You are using your personal workspace records.'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Records
            </button>
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Workspace Data
            </button>
          </div>
        </div>
      </div>

      {/* GitHub Pages & Architecture Details */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 text-xs text-slate-600 dark:text-slate-400">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
          <ExternalLink className="w-4 h-4 text-indigo-500" />
          Deployment Architecture & Static Hosting
        </h3>
        <p className="leading-relaxed mb-3">
          DevFlow is compiled into an ultra-fast, zero-runtime static bundle that operates seamlessly
          on GitHub Pages or any static CDN. It employs hash-based routing (<code>#projects</code>,{' '}
          <code>#tasks</code>) to ensure direct URL refreshes without 404 routing fallbacks, and
          preserves full offline reliability using localStorage.
        </p>
        <div className="flex flex-wrap gap-4 text-slate-500">
          <span>• Framework: React 19 + TypeScript</span>
          <span>• Bundler: Vite (base: './')</span>
          <span>• Styling: Tailwind CSS v4</span>
          <span>• Storage Schema: v1</span>
        </div>
      </div>

      {/* Diff Modal for Import */}
      {importSummary && (
        <ImportDiffModal
          isOpen={!!importSummary}
          onClose={() => setImportSummary(null)}
          onConfirm={handleConfirmImport}
          incomingData={importSummary.parsedData}
          currentData={data}
          summary={importSummary.summary}
        />
      )}

      {/* Clear Confirmation */}
      <ConfirmDialog
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={() => {
          clearDemoData();
          setConfirmClearOpen(false);
          showToast('Workspace Cleared', 'All sample and custom records removed', 'info');
        }}
        title="Clear All Workspace Records?"
        message="This action will delete all projects, tasks, snippets, notes, and bookmarks from local storage. Make sure to export a backup if you wish to keep any records."
        confirmLabel="Clear Everything"
        isDestructive
      />

      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          resetDemoData();
          setConfirmResetOpen(false);
          showToast('Demo Data Restored', 'Workspace restored to clean sample records', 'success');
        }}
        title="Reset to Fresh Demo Data?"
        message="This will overwrite current records with fresh, realistic sample projects, tasks, code snippets, and notes with dynamic relative dates."
        confirmLabel="Reset Workspace"
      />
    </div>
  );
};
