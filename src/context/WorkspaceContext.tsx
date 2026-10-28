/**
 * DevFlow Core Application Context
 * Centralizes real reactive application state, CRUD operations, global focus timer, routing, and toasts.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {
  WorkspaceData,
  Project,
  Task,
  Snippet,
  Note,
  Bookmark,
  FocusSession,
  FocusSessionType,
  ActivityLog,
  AppSettings,
  PomodoroSettings,
  NavigationTab,
  ToastMessage,
  ToastType,
  TaskStatus,
} from '../types';
import {
  loadWorkspaceData,
  saveWorkspaceData,
  clearDemoData as clearDemoDataStorage,
  resetToDemoData as resetToDemoDataStorage,
  generateId,
} from '../services/storage';
import { playCompletionChime } from '../services/audio';

interface WorkspaceContextType {
  data: WorkspaceData;
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;

  // Project CRUD
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  deleteProject: (id: string, deleteTasks: boolean) => void;

  // Task CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;

  // Snippet CRUD
  addSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => Snippet;
  updateSnippet: (id: string, updates: Partial<Omit<Snippet, 'id' | 'createdAt'>>) => void;
  deleteSnippet: (id: string) => void;
  toggleSnippetFavorite: (id: string) => void;

  // Note CRUD
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => void;
  toggleNoteFavorite: (id: string) => void;

  // Bookmark CRUD
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => Bookmark;
  updateBookmark: (id: string, updates: Partial<Omit<Bookmark, 'id' | 'createdAt'>>) => void;
  deleteBookmark: (id: string) => void;

  // Focus Timer Singleton State & Actions
  timerState: {
    status: 'idle' | 'running' | 'paused';
    sessionType: FocusSessionType;
    remainingSeconds: number;
    totalDurationSeconds: number;
    selectedProjectId: string | null;
    selectedTaskId: string | null;
    completedFocusCount: number;
  };
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipTimerSession: () => void;
  setTimerSessionType: (type: FocusSessionType) => void;
  setTimerProject: (projectId: string | null) => void;
  setTimerTask: (taskId: string | null) => void;

  // Settings & Storage Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  updatePomodoroSettings: (updates: Partial<PomodoroSettings>) => void;
  clearDemoData: () => void;
  resetDemoData: () => void;
  replaceWorkspaceData: (newData: WorkspaceData) => void;

  // Notifications
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

function getTabFromHash(): NavigationTab {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  const validTabs: NavigationTab[] = [
    'dashboard',
    'projects',
    'tasks',
    'snippets',
    'notes',
    'bookmarks',
    'focus',
    'analytics',
    'settings',
  ];
  return validTabs.includes(hash as NavigationTab) ? (hash as NavigationTab) : 'dashboard';
}

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<WorkspaceData>(() => loadWorkspaceData());
  const [currentTab, setCurrentTabState] = useState<NavigationTab>(() => getTabFromHash());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hash-based router listener
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentTabState(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setCurrentTab = useCallback((tab: NavigationTab) => {
    window.location.hash = `#${tab}`;
    setCurrentTabState(tab);
  }, []);

  // Theme synchronization with document element
  useEffect(() => {
    const root = document.documentElement;
    const theme = data.settings.theme;

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [data.settings.theme]);

  // Persist data on change
  const persist = useCallback((updater: (prev: WorkspaceData) => WorkspaceData) => {
    setData((prev) => {
      const next = updater(prev);
      saveWorkspaceData(next);
      return next;
    });
  }, []);

  // Toast notifications
  const showToast = useCallback(
    (title: string, message?: string, type: ToastType = 'info', duration = 3500) => {
      const id = generateId('toast');
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Activity logger helper
  const logActivity = useCallback(
    (actionType: ActivityLog['actionType'], entityType: ActivityLog['entityType'], entityTitle: string) => {
      const newActivity: ActivityLog = {
        id: generateId('act'),
        actionType,
        entityType,
        entityTitle,
        timestamp: new Date().toISOString(),
      };
      persist((prev) => ({
        ...prev,
        activities: [newActivity, ...prev.activities.slice(0, 99)],
      }));
    },
    [persist]
  );

  // --------------------------------------------------------------------------
  // Focus Timer Singleton State & Lifecycle
  // --------------------------------------------------------------------------
  const pomodoroSettings = data.settings.pomodoro;
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [sessionType, setSessionType] = useState<FocusSessionType>('focus');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => pomodoroSettings.focusDuration * 60);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [completedFocusCount, setCompletedFocusCount] = useState<number>(0);

  // Target timestamp for reconciliation when tab is backgrounded
  const targetEndTimeRef = useRef<number | null>(null);

  // Helper to calculate total duration in seconds for current session type
  const getSessionDurationSeconds = useCallback(
    (type: FocusSessionType): number => {
      if (type === 'focus') return data.settings.pomodoro.focusDuration * 60;
      if (type === 'short_break') return data.settings.pomodoro.shortBreak * 60;
      return data.settings.pomodoro.longBreak * 60;
    },
    [data.settings.pomodoro]
  );

  // When timer settings change and timer is idle, refresh remainingSeconds
  useEffect(() => {
    if (timerStatus === 'idle') {
      setRemainingSeconds(getSessionDurationSeconds(sessionType));
    }
  }, [sessionType, timerStatus, getSessionDurationSeconds]);

  // Main countdown loop with timestamp reconciliation
  useEffect(() => {
    if (timerStatus !== 'running') return;

    const interval = setInterval(() => {
      if (targetEndTimeRef.current === null) return;

      const now = Date.now();
      const diff = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));

      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
        handleSessionCompletion();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [timerStatus]);

  // Complete session handler
  const handleSessionCompletion = useCallback(() => {
    setTimerStatus('idle');
    targetEndTimeRef.current = null;

    if (data.settings.pomodoro.soundEnabled) {
      playCompletionChime();
    }

    if (sessionType === 'focus') {
      const durationMinutes = data.settings.pomodoro.focusDuration;
      const completedAt = new Date().toISOString();

      // Record focus session in actual persistent data
      const newSession: FocusSession = {
        id: generateId('sess'),
        type: 'focus',
        durationMinutes,
        completedAt,
        projectId: selectedProjectId || undefined,
        taskId: selectedTaskId || undefined,
      };

      persist((prev) => ({
        ...prev,
        focusSessions: [newSession, ...prev.focusSessions],
      }));

      logActivity('focus_completed', 'session', `${durationMinutes}m Focus Session Completed`);
      showToast('Focus Session Finished!', `Great job! You completed ${durationMinutes} minutes of focused work.`, 'success', 5000);

      // Determine next session (Short break vs Long break)
      const nextCount = completedFocusCount + 1;
      setCompletedFocusCount(nextCount);

      const isLongBreak = nextCount % data.settings.pomodoro.longBreakInterval === 0;
      const nextType: FocusSessionType = isLongBreak ? 'long_break' : 'short_break';
      setSessionType(nextType);
      setRemainingSeconds(getSessionDurationSeconds(nextType));
    } else {
      showToast('Break Finished', 'Ready to dive back into deep work?', 'info', 4000);
      setSessionType('focus');
      setRemainingSeconds(getSessionDurationSeconds('focus'));
    }
  }, [
    sessionType,
    data.settings.pomodoro,
    selectedProjectId,
    selectedTaskId,
    completedFocusCount,
    persist,
    logActivity,
    showToast,
    getSessionDurationSeconds,
  ]);

  const startTimer = useCallback(() => {
    const total = getSessionDurationSeconds(sessionType);
    setRemainingSeconds(total);
    targetEndTimeRef.current = Date.now() + total * 1000;
    setTimerStatus('running');
  }, [sessionType, getSessionDurationSeconds]);

  const pauseTimer = useCallback(() => {
    setTimerStatus('paused');
    targetEndTimeRef.current = null;
  }, []);

  const resumeTimer = useCallback(() => {
    targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    setTimerStatus('running');
  }, [remainingSeconds]);

  const resetTimer = useCallback(() => {
    setTimerStatus('idle');
    targetEndTimeRef.current = null;
    setRemainingSeconds(getSessionDurationSeconds(sessionType));
  }, [sessionType, getSessionDurationSeconds]);

  const skipTimerSession = useCallback(() => {
    setTimerStatus('idle');
    targetEndTimeRef.current = null;
    const nextType: FocusSessionType = sessionType === 'focus' ? 'short_break' : 'focus';
    setSessionType(nextType);
    setRemainingSeconds(getSessionDurationSeconds(nextType));
    showToast(`Skipped to ${nextType === 'focus' ? 'Focus Session' : 'Break'}`, undefined, 'info');
  }, [sessionType, getSessionDurationSeconds, showToast]);

  const setTimerSessionType = useCallback(
    (type: FocusSessionType) => {
      setTimerStatus('idle');
      targetEndTimeRef.current = null;
      setSessionType(type);
      setRemainingSeconds(getSessionDurationSeconds(type));
    },
    [getSessionDurationSeconds]
  );

  // --------------------------------------------------------------------------
  // Project CRUD
  // --------------------------------------------------------------------------
  const addProject = useCallback(
    (projectInput: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
      const now = new Date().toISOString();
      const newProject: Project = {
        ...projectInput,
        id: generateId('proj'),
        createdAt: now,
        updatedAt: now,
      };

      persist((prev) => ({
        ...prev,
        projects: [newProject, ...prev.projects],
      }));

      logActivity('create', 'project', newProject.name);
      showToast('Project Created', `Project "${newProject.name}" has been added.`, 'success');
      return newProject;
    },
    [persist, logActivity, showToast]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
      let projectName = '';
      persist((prev) => {
        const updated = prev.projects.map((p) => {
          if (p.id === id) {
            projectName = updates.name || p.name;
            return { ...p, ...updates, updatedAt: new Date().toISOString() };
          }
          return p;
        });
        return { ...prev, projects: updated };
      });

      logActivity('update', 'project', projectName || 'Project');
      showToast('Project Updated', `Changes to "${projectName}" saved.`, 'success');
    },
    [persist, logActivity, showToast]
  );

  const deleteProject = useCallback(
    (id: string, deleteTasks: boolean) => {
      let projectName = '';
      persist((prev) => {
        const target = prev.projects.find((p) => p.id === id);
        if (target) projectName = target.name;

        const updatedProjects = prev.projects.filter((p) => p.id !== id);
        let updatedTasks = prev.tasks;

        if (deleteTasks) {
          updatedTasks = prev.tasks.filter((t) => t.projectId !== id);
        } else {
          // Reassign associated tasks to unassigned
          updatedTasks = prev.tasks.map((t) => (t.projectId === id ? { ...t, projectId: undefined } : t));
        }

        return {
          ...prev,
          projects: updatedProjects,
          tasks: updatedTasks,
        };
      });

      logActivity('delete', 'project', projectName || 'Project');
      showToast(
        'Project Deleted',
        deleteTasks ? `Deleted project and its tasks.` : `Project deleted. Associated tasks kept as unassigned.`,
        'info'
      );
    },
    [persist, logActivity, showToast]
  );

  // --------------------------------------------------------------------------
  // Task CRUD
  // --------------------------------------------------------------------------
  const addTask = useCallback(
    (taskInput: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...taskInput,
        id: generateId('task'),
        createdAt: now,
        updatedAt: now,
      };

      persist((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
      }));

      logActivity('create', 'task', newTask.title);
      showToast('Task Created', `Task "${newTask.title}" added to ${newTask.status.toUpperCase()}.`, 'success');
      return newTask;
    },
    [persist, logActivity, showToast]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
      let taskTitle = '';
      persist((prev) => {
        const updated = prev.tasks.map((t) => {
          if (t.id === id) {
            taskTitle = updates.title || t.title;
            return { ...t, ...updates, updatedAt: new Date().toISOString() };
          }
          return t;
        });
        return { ...prev, tasks: updated };
      });

      logActivity('update', 'task', taskTitle || 'Task');
      showToast('Task Updated', `"${taskTitle}" updated.`, 'success');
    },
    [persist, logActivity, showToast]
  );

  const deleteTask = useCallback(
    (id: string) => {
      let taskTitle = '';
      persist((prev) => {
        const target = prev.tasks.find((t) => t.id === id);
        if (target) taskTitle = target.title;
        return {
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== id),
        };
      });

      logActivity('delete', 'task', taskTitle || 'Task');
      showToast('Task Removed', `"${taskTitle}" was deleted.`, 'info');
    },
    [persist, logActivity, showToast]
  );

  const moveTask = useCallback(
    (id: string, newStatus: TaskStatus) => {
      let taskTitle = '';
      let isCompleted = false;

      persist((prev) => {
        const updated = prev.tasks.map((t) => {
          if (t.id === id) {
            taskTitle = t.title;
            isCompleted = newStatus === 'done' && t.status !== 'done';
            return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
          }
          return t;
        });
        return { ...prev, tasks: updated };
      });

      if (isCompleted) {
        logActivity('complete', 'task', taskTitle);
        showToast('Task Completed! 🎉', `"${taskTitle}" marked as Done.`, 'success');
      } else {
        logActivity('update', 'task', `Moved "${taskTitle}" to ${newStatus}`);
      }
    },
    [persist, logActivity, showToast]
  );

  // --------------------------------------------------------------------------
  // Snippet CRUD
  // --------------------------------------------------------------------------
  const addSnippet = useCallback(
    (snippetInput: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Snippet => {
      const now = new Date().toISOString();
      const newSnippet: Snippet = {
        ...snippetInput,
        id: generateId('snip'),
        createdAt: now,
        updatedAt: now,
      };

      persist((prev) => ({
        ...prev,
        snippets: [newSnippet, ...prev.snippets],
      }));

      logActivity('create', 'snippet', newSnippet.title);
      showToast('Snippet Saved', `Snippet "${newSnippet.title}" added to library.`, 'success');
      return newSnippet;
    },
    [persist, logActivity, showToast]
  );

  const updateSnippet = useCallback(
    (id: string, updates: Partial<Omit<Snippet, 'id' | 'createdAt'>>) => {
      let snippetTitle = '';
      persist((prev) => {
        const updated = prev.snippets.map((s) => {
          if (s.id === id) {
            snippetTitle = updates.title || s.title;
            return { ...s, ...updates, updatedAt: new Date().toISOString() };
          }
          return s;
        });
        return { ...prev, snippets: updated };
      });

      logActivity('update', 'snippet', snippetTitle || 'Snippet');
      showToast('Snippet Updated', `"${snippetTitle}" saved.`, 'success');
    },
    [persist, logActivity, showToast]
  );

  const deleteSnippet = useCallback(
    (id: string) => {
      let title = '';
      persist((prev) => {
        const target = prev.snippets.find((s) => s.id === id);
        if (target) title = target.title;
        return {
          ...prev,
          snippets: prev.snippets.filter((s) => s.id !== id),
        };
      });

      logActivity('delete', 'snippet', title || 'Snippet');
      showToast('Snippet Deleted', `"${title}" removed from library.`, 'info');
    },
    [persist, logActivity, showToast]
  );

  const toggleSnippetFavorite = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        snippets: prev.snippets.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s)),
      }));
    },
    [persist]
  );

  // --------------------------------------------------------------------------
  // Note CRUD
  // --------------------------------------------------------------------------
  const addNote = useCallback(
    (noteInput: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
      const now = new Date().toISOString();
      const newNote: Note = {
        ...noteInput,
        id: generateId('note'),
        createdAt: now,
        updatedAt: now,
      };

      persist((prev) => ({
        ...prev,
        notes: [newNote, ...prev.notes],
      }));

      logActivity('create', 'note', newNote.title);
      showToast('Note Created', `"${newNote.title}" created.`, 'success');
      return newNote;
    },
    [persist, logActivity, showToast]
  );

  const updateNote = useCallback(
    (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
      persist((prev) => ({
        ...prev,
        notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)),
      }));
    },
    [persist]
  );

  const deleteNote = useCallback(
    (id: string) => {
      let title = '';
      persist((prev) => {
        const target = prev.notes.find((n) => n.id === id);
        if (target) title = target.title;
        return {
          ...prev,
          notes: prev.notes.filter((n) => n.id !== id),
        };
      });

      logActivity('delete', 'note', title || 'Note');
      showToast('Note Deleted', `"${title}" was removed.`, 'info');
    },
    [persist, logActivity, showToast]
  );

  const toggleNoteFavorite = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        notes: prev.notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)),
      }));
    },
    [persist]
  );

  // --------------------------------------------------------------------------
  // Bookmark CRUD
  // --------------------------------------------------------------------------
  const addBookmark = useCallback(
    (bookmarkInput: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Bookmark => {
      const now = new Date().toISOString();
      const newBookmark: Bookmark = {
        ...bookmarkInput,
        id: generateId('bm'),
        createdAt: now,
        updatedAt: now,
      };

      persist((prev) => ({
        ...prev,
        bookmarks: [newBookmark, ...prev.bookmarks],
      }));

      logActivity('create', 'bookmark', newBookmark.title);
      showToast('Bookmark Saved', `Added "${newBookmark.title}".`, 'success');
      return newBookmark;
    },
    [persist, logActivity, showToast]
  );

  const updateBookmark = useCallback(
    (id: string, updates: Partial<Omit<Bookmark, 'id' | 'createdAt'>>) => {
      let title = '';
      persist((prev) => {
        const updated = prev.bookmarks.map((b) => {
          if (b.id === id) {
            title = updates.title || b.title;
            return { ...b, ...updates, updatedAt: new Date().toISOString() };
          }
          return b;
        });
        return { ...prev, bookmarks: updated };
      });

      logActivity('update', 'bookmark', title || 'Bookmark');
      showToast('Bookmark Updated', `Changes to "${title}" saved.`, 'success');
    },
    [persist, logActivity, showToast]
  );

  const deleteBookmark = useCallback(
    (id: string) => {
      let title = '';
      persist((prev) => {
        const target = prev.bookmarks.find((b) => b.id === id);
        if (target) title = target.title;
        return {
          ...prev,
          bookmarks: prev.bookmarks.filter((b) => b.id !== id),
        };
      });

      logActivity('delete', 'bookmark', title || 'Bookmark');
      showToast('Bookmark Removed', `"${title}" deleted.`, 'info');
    },
    [persist, logActivity, showToast]
  );

  // --------------------------------------------------------------------------
  // Settings & Global Workspace Operations
  // --------------------------------------------------------------------------
  const updateSettings = useCallback(
    (updates: Partial<AppSettings>) => {
      persist((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...updates,
        },
      }));
      showToast('Settings Saved', 'Preferences have been updated.', 'success');
    },
    [persist, showToast]
  );

  const updatePomodoroSettings = useCallback(
    (updates: Partial<PomodoroSettings>) => {
      persist((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          pomodoro: {
            ...prev.settings.pomodoro,
            ...updates,
          },
        },
      }));
      showToast('Timer Settings Saved', 'Focus intervals updated.', 'success');
    },
    [persist, showToast]
  );

  const clearDemoDataAction = useCallback(() => {
    setData((prev) => clearDemoDataStorage(prev));
    showToast('Demo Data Cleared', 'Workspace is now clean and ready for your records.', 'info');
  }, [showToast]);

  const resetDemoDataAction = useCallback(() => {
    const demo = resetToDemoDataStorage();
    setData(demo);
    showToast('Reset to Demo Records', 'Initial sample projects, tasks, and notes restored.', 'info');
  }, [showToast]);

  const replaceWorkspaceData = useCallback(
    (newData: WorkspaceData) => {
      saveWorkspaceData(newData);
      setData(newData);
      showToast('Workspace Imported Successfully', 'All projects, tasks, notes, and records restored.', 'success');
    },
    [showToast]
  );

  const value: WorkspaceContextType = {
    data,
    currentTab,
    setCurrentTab,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    toggleSnippetFavorite,
    addNote,
    updateNote,
    deleteNote,
    toggleNoteFavorite,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    timerState: {
      status: timerStatus,
      sessionType,
      remainingSeconds,
      totalDurationSeconds: getSessionDurationSeconds(sessionType),
      selectedProjectId,
      selectedTaskId,
      completedFocusCount,
    },
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimerSession,
    setTimerSessionType,
    setTimerProject: setSelectedProjectId,
    setTimerTask: setSelectedTaskId,
    updateSettings,
    updatePomodoroSettings,
    clearDemoData: clearDemoDataAction,
    resetDemoData: resetDemoDataAction,
    replaceWorkspaceData,
    toasts,
    showToast,
    dismissToast,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
