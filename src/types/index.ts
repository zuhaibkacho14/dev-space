/**
 * DevFlow Domain Types and Interfaces
 */

export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'on_hold';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string; // Hex color for visual identity (e.g., #6366f1, #10b981)
  status: ProjectStatus;
  startDate: string; // ISO date string YYYY-MM-DD
  deadline: string; // ISO date string YYYY-MM-DD
  repoUrl?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId?: string; // Optional foreign key to Project
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string; // ISO date string YYYY-MM-DD
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type SnippetLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'html'
  | 'css'
  | 'sql'
  | 'json'
  | 'bash'
  | 'markdown'
  | 'plaintext';

export interface Snippet {
  id: string;
  title: string;
  language: SnippetLanguage;
  description: string;
  code: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BookmarkCategory =
  | 'Documentation'
  | 'GitHub'
  | 'Articles'
  | 'Tools'
  | 'Inspiration'
  | 'Other';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: BookmarkCategory;
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type FocusSessionType = 'focus' | 'short_break' | 'long_break';

export interface FocusSession {
  id: string;
  type: FocusSessionType;
  durationMinutes: number;
  completedAt: string; // ISO timestamp
  projectId?: string;
  taskId?: string;
  notes?: string;
}

export type ActionType = 'create' | 'update' | 'delete' | 'complete' | 'focus_completed';
export type EntityType = 'project' | 'task' | 'snippet' | 'note' | 'bookmark' | 'session' | 'system';

export interface ActivityLog {
  id: string;
  actionType: ActionType;
  entityType: EntityType;
  entityTitle: string;
  timestamp: string; // ISO timestamp
}

export interface PomodoroSettings {
  focusDuration: number; // in minutes (default: 25)
  shortBreak: number; // in minutes (default: 5)
  longBreak: number; // in minutes (default: 15)
  longBreakInterval: number; // sessions before long break (default: 4)
  soundEnabled: boolean;
  autoStartBreaks: boolean;
}

export type ThemePreference = 'dark' | 'light' | 'system';
export type WeekStartsOn = 'monday' | 'sunday';

export interface AppSettings {
  theme: ThemePreference;
  weekStartsOn: WeekStartsOn;
  pomodoro: PomodoroSettings;
  schemaVersion: number;
}

export interface WorkspaceData {
  projects: Project[];
  tasks: Task[];
  snippets: Snippet[];
  notes: Note[];
  bookmarks: Bookmark[];
  focusSessions: FocusSession[];
  activities: ActivityLog[];
  settings: AppSettings;
  isDemoData: boolean;
  exportTimestamp?: string;
}

export type NavigationTab =
  | 'dashboard'
  | 'projects'
  | 'tasks'
  | 'snippets'
  | 'notes'
  | 'bookmarks'
  | 'focus'
  | 'analytics'
  | 'settings';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
