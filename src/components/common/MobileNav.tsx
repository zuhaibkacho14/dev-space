import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Timer,
  Menu,
  X,
  FolderKanban,
  Code2,
  Bookmark,
  BarChart3,
  Settings,
} from 'lucide-react';
import { NavigationTab } from '../../types';

export const MobileNav: React.FC = () => {
  const { currentTab, setCurrentTab, data, timerState } = useWorkspace();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openTasksCount = data.tasks.filter((t) => t.status !== 'done').length;

  const handleSelect = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setDrawerOpen(false);
  };

  const primaryItems = [
    { tab: 'dashboard' as NavigationTab, label: 'Home', icon: LayoutDashboard },
    {
      tab: 'tasks' as NavigationTab,
      label: 'Tasks',
      icon: CheckSquare,
      badge: openTasksCount > 0 ? openTasksCount : undefined,
    },
    { tab: 'notes' as NavigationTab, label: 'Notes', icon: FileText },
    {
      tab: 'focus' as NavigationTab,
      label: 'Focus',
      icon: Timer,
      badge:
        timerState.status === 'running'
          ? `${Math.floor(timerState.remainingSeconds / 60)}m`
          : undefined,
    },
  ];

  const drawerItems = [
    { tab: 'projects' as NavigationTab, label: 'Projects', icon: FolderKanban, count: data.projects.length },
    { tab: 'snippets' as NavigationTab, label: 'Code Snippets', icon: Code2, count: data.snippets.length },
    { tab: 'bookmarks' as NavigationTab, label: 'Bookmarks', icon: Bookmark, count: data.bookmarks.length },
    { tab: 'analytics' as NavigationTab, label: 'Analytics & Metrics', icon: BarChart3 },
    { tab: 'settings' as NavigationTab, label: 'Settings & Data', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Up Drawer */}
      <div
        className={`fixed inset-x-0 bottom-16 z-50 bg-slate-900 border-t border-slate-800 rounded-t-2xl shadow-2xl p-5 md:hidden transition-transform duration-200 ${
          drawerOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-mono font-bold">
              &lt;/&gt;
            </div>
            <span className="font-bold text-xs text-slate-100">DevFlow Workspace</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {drawerItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;

            return (
              <button
                key={item.tab}
                onClick={() => handleSelect(item.tab)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed Mobile Bottom Bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 md:hidden"
        aria-label="Mobile Navigation"
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.tab;

          return (
            <button
              key={item.tab}
              onClick={() => handleSelect(item.tab)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition relative ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 shrink-0" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full text-[9px] font-mono font-bold bg-indigo-600 text-white leading-tight">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition ${
            drawerOpen ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Open more navigation"
        >
          <Menu className="w-5 h-5" />
          <span className="mt-1">More</span>
        </button>
      </nav>
    </>
  );
};
