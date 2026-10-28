import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Code2,
  FileText,
  Bookmark,
  Timer,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  HardDrive,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { calculateStorageUsage } from '../../services/storage';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, data, timerState } = useWorkspace();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Calculate open tasks badge
  const openTasksCount = data.tasks.filter((t) => t.status !== 'done').length;

  // Calculate storage usage
  const storage = calculateStorageUsage();

  const navItems: { tab: NavigationTab; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'projects', label: 'Projects', icon: FolderKanban, badge: data.projects.length },
    { tab: 'tasks', label: 'Tasks', icon: CheckSquare, badge: openTasksCount > 0 ? openTasksCount : undefined },
    { tab: 'snippets', label: 'Snippets', icon: Code2, badge: data.snippets.length },
    { tab: 'notes', label: 'Notes', icon: FileText, badge: data.notes.length },
    { tab: 'bookmarks', label: 'Bookmarks', icon: Bookmark, badge: data.bookmarks.length },
    {
      tab: 'focus',
      label: 'Focus Timer',
      icon: Timer,
      badge:
        timerState.status === 'running'
          ? `${Math.floor(timerState.remainingSeconds / 60)}m`
          : undefined,
    },
    { tab: 'analytics', label: 'Analytics', icon: BarChart3 },
    { tab: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 shrink-0 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
      aria-label="Main Navigation"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-900/30">
            <span className="font-mono font-bold text-sm tracking-tighter">&lt;/&gt;</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-sm text-slate-100 tracking-tight block truncate">
                DevFlow
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                Developer Workspace
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => setCurrentTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold transition ${
                    isActive
                      ? 'bg-indigo-700/80 text-white'
                      : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Indicator dot on collapsed state if badge exists */}
              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Storage and Session Status Footer */}
      {!isCollapsed ? (
        <div className="p-4 border-t border-slate-800 space-y-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3 h-3 text-slate-500" />
                Local Storage
              </span>
              <span className="font-mono text-[10px]">{storage.usedKb} KB</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(4, storage.percentage)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Offline-first browser storage
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-800 flex justify-center shrink-0">
          <div
            className="w-2 h-2 rounded-full bg-emerald-500"
            title={`Storage: ${storage.usedKb} KB used`}
          />
        </div>
      )}
    </aside>
  );
};
