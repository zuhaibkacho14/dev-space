/**
 * DevFlow Storage Layer
 * LocalStorage management with schema versioning, validation, import/export, and initial demo records.
 */

import {
  WorkspaceData,
  Project,
  Task,
  Snippet,
  Note,
  Bookmark,
  FocusSession,
  ActivityLog,
  AppSettings,
} from '../types';

export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'devflow_workspace_v1';

export function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  weekStartsOn: 'monday',
  pomodoro: {
    focusDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    autoStartBreaks: false,
  },
  schemaVersion: SCHEMA_VERSION,
};

// Generates relative dates for demo data so dates are always realistic relative to current date
function getRelativeDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export function createInitialDemoData(): WorkspaceData {
  const now = new Date().toISOString();

  const projects: Project[] = [
    {
      id: 'proj_cloudflow',
      name: 'CloudFlow Telemetry',
      description: 'Distributed microservice pipeline coordinating real-time metric streams with sub-50ms latency.',
      color: '#6366f1', // Indigo
      status: 'in_progress',
      startDate: getRelativeDate(-20),
      deadline: getRelativeDate(12),
      repoUrl: 'https://github.com/example/cloudflow-telemetry',
      createdAt: getRelativeDate(-20) + 'T10:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'proj_devflow',
      name: 'DevFlow Workspace',
      description: 'Modern developer productivity hub combining project tracking, snippets, notes, and pomodoro timer.',
      color: '#10b981', // Emerald
      status: 'in_progress',
      startDate: getRelativeDate(-10),
      deadline: getRelativeDate(5),
      repoUrl: 'https://github.com/example/devflow',
      createdAt: getRelativeDate(-10) + 'T09:30:00.000Z',
      updatedAt: now,
    },
    {
      id: 'proj_designsystem',
      name: 'Prism Design Tokens',
      description: 'Unified accessible color palettes, typography scales, and CSS variable architecture.',
      color: '#8b5cf6', // Violet
      status: 'planned',
      startDate: getRelativeDate(2),
      deadline: getRelativeDate(30),
      createdAt: getRelativeDate(-4) + 'T14:15:00.000Z',
      updatedAt: now,
    },
  ];

  const tasks: Task[] = [
    {
      id: 'task_1',
      title: 'Optimize Redis query pipeline for high concurrency',
      description: 'Implement multi-key pipelining and connection pooling to reduce network round-trips.',
      projectId: 'proj_cloudflow',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: getRelativeDate(0), // Due Today
      tags: ['Backend', 'Performance', 'Redis'],
      createdAt: getRelativeDate(-5) + 'T11:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'task_2',
      title: 'Audit WCAG 2.1 AA keyboard focus indicators',
      description: 'Ensure all interactive modals, dropdowns, and buttons show visible outline on keyboard tab.',
      projectId: 'proj_devflow',
      priority: 'high',
      status: 'todo',
      dueDate: getRelativeDate(1), // Due Tomorrow
      tags: ['Accessibility', 'A11y', 'UI'],
      createdAt: getRelativeDate(-3) + 'T15:20:00.000Z',
      updatedAt: now,
    },
    {
      id: 'task_3',
      title: 'Set up GitHub Actions workflow for static Pages deploy',
      description: 'Add reproducible pnpm/npm cache, test run, and Pages deploy artifact upload.',
      projectId: 'proj_devflow',
      priority: 'high',
      status: 'done',
      dueDate: getRelativeDate(-1),
      tags: ['DevOps', 'CI/CD'],
      createdAt: getRelativeDate(-7) + 'T08:00:00.000Z',
      updatedAt: getRelativeDate(-1) + 'T17:00:00.000Z',
    },
    {
      id: 'task_4',
      title: 'Draft OpenAPI 3.1 specification for telemetry ingest',
      description: 'Document schema definitions for incoming payload batched metrics.',
      projectId: 'proj_cloudflow',
      priority: 'medium',
      status: 'todo',
      dueDate: getRelativeDate(4),
      tags: ['API', 'Documentation'],
      createdAt: getRelativeDate(-2) + 'T12:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'task_5',
      title: 'Refactor database migration rollback script',
      description: 'Validate idempotent down migrations on staging database snapshot.',
      projectId: 'proj_cloudflow',
      priority: 'urgent',
      status: 'backlog',
      dueDate: getRelativeDate(-2), // Overdue
      tags: ['Database', 'Postgres'],
      createdAt: getRelativeDate(-8) + 'T09:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'task_6',
      title: 'Create dark/light theme CSS variables and tokens',
      description: 'Build semantic tokens for surface backgrounds, subtle borders, and contrast text.',
      projectId: 'proj_designsystem',
      priority: 'low',
      status: 'backlog',
      dueDate: getRelativeDate(14),
      tags: ['CSS', 'Design'],
      createdAt: getRelativeDate(-1) + 'T16:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'task_7',
      title: 'Implement Pomodoro background timer reconciliation',
      description: 'Use target timestamps to reconcile remaining duration if page tab is suspended.',
      projectId: 'proj_devflow',
      priority: 'high',
      status: 'done',
      dueDate: getRelativeDate(-2),
      tags: ['Frontend', 'Timer'],
      createdAt: getRelativeDate(-6) + 'T10:00:00.000Z',
      updatedAt: getRelativeDate(-2) + 'T18:00:00.000Z',
    },
    {
      id: 'task_8',
      title: 'Write unit tests for JSON import schema validator',
      description: 'Verify malicious payloads and missing fields are rejected without altering state.',
      projectId: 'proj_devflow',
      priority: 'medium',
      status: 'in_progress',
      dueDate: getRelativeDate(2),
      tags: ['Testing', 'Security'],
      createdAt: getRelativeDate(-3) + 'T14:00:00.000Z',
      updatedAt: now,
    },
  ];

  const snippets: Snippet[] = [
    {
      id: 'snip_1',
      title: 'TypeScript Safe Exhaustive Switch Pattern',
      language: 'typescript',
      description: 'Guarantees compile-time exhaustiveness checking for discriminated unions.',
      code: `export function assertNever(x: never): never {
  throw new Error(\`Unexpected object in exhaustive check: \${JSON.stringify(x)}\`);
}

// Usage in reducer or state machine:
type Action = { type: 'open' } | { type: 'close' };

function handle(action: Action) {
  switch (action.type) {
    case 'open':
      return 'Opened';
    case 'close':
      return 'Closed';
    default:
      return assertNever(action); // Compile error if new variant added!
  }
}`,
      tags: ['TypeScript', 'Utility', 'Types'],
      isFavorite: true,
      createdAt: getRelativeDate(-8) + 'T11:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'snip_2',
      title: 'Python Async Worker Pool with Semaphore',
      language: 'python',
      description: 'Controls concurrent HTTP fetch tasks with bounded concurrency.',
      code: `import asyncio
import aiohttp

async def fetch_worker(url: str, session: aiohttp.ClientSession, sem: asyncio.Semaphore):
    async with sem:
        async with session.get(url, timeout=10) as response:
            return await response.json()

async def run_batch(urls: list[str], max_concurrency: int = 5):
    sem = asyncio.Semaphore(max_concurrency)
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_worker(u, session, sem) for u in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)`,
      tags: ['Python', 'Async', 'Concurrency'],
      isFavorite: true,
      createdAt: getRelativeDate(-6) + 'T14:30:00.000Z',
      updatedAt: now,
    },
    {
      id: 'snip_3',
      title: 'PostgreSQL Running Total with Window Function',
      language: 'sql',
      description: 'Calculates cumulative sum and moving averages across date partitions.',
      code: `SELECT
  date_trunc('day', completed_at) AS day,
  count(id) AS daily_tasks,
  sum(count(id)) OVER (
    ORDER BY date_trunc('day', completed_at)
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS cumulative_tasks
FROM tasks
WHERE status = 'done'
GROUP BY 1
ORDER BY 1 DESC;`,
      tags: ['SQL', 'Analytics', 'PostgreSQL'],
      isFavorite: false,
      createdAt: getRelativeDate(-4) + 'T16:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'snip_4',
      title: 'Bash Production Health-Check Script',
      language: 'bash',
      description: 'Polls HTTP endpoint with retries and notifies on non-200 status code.',
      code: `#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="https://api.example.com/healthz"
MAX_RETRIES=3

for ((i=1; i<=MAX_RETRIES; i++)); do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL" || true)
  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "Service is healthy (Attempt $i)"
    exit 0
  fi
  echo "Attempt $i failed with status $HTTP_STATUS, retrying in 3s..."
  sleep 3
done

echo "CRITICAL: Service health check failed after $MAX_RETRIES retries!"
exit 1`,
      tags: ['Bash', 'DevOps', 'Monitoring'],
      isFavorite: false,
      createdAt: getRelativeDate(-2) + 'T09:15:00.000Z',
      updatedAt: now,
    },
  ];

  const notes: Note[] = [
    {
      id: 'note_1',
      title: 'Architecture Decision: Event-Driven vs Long Polling',
      content: `# ADR: Stream Ingestion Strategy

## Status: Accepted

## Context
Our telemetry ingestion pipeline receives thousands of status heartbeats every second from edge nodes. We need a reliable notification mechanism for developer dashboards without overwhelming socket servers.

## Decision
We chose Server-Sent Events (SSE) for unidirectional dashboard metric streams, combined with Redis Pub/Sub for worker coordination.

## Trade-offs
- **Pros:** Native browser reconnection, zero custom framing, standard HTTP/2 multiplexing.
- **Cons:** SSE is unidirectional; commands still require standard POST endpoints.`,
      tags: ['Architecture', 'ADR', 'System Design'],
      isFavorite: true,
      createdAt: getRelativeDate(-9) + 'T10:00:00.000Z',
      updatedAt: getRelativeDate(-1) + 'T15:00:00.000Z',
    },
    {
      id: 'note_2',
      title: 'Web Application Security Hardening Checklist',
      content: `# API & Client Security Guidelines

1. **Content Security Policy:** Ensure script-src does not allow unsafe-inline or unsafe-eval.
2. **URL Protocols:** Strictly sanitize user-submitted bookmarks; reject \`javascript:\` and \`data:\` schemes.
3. **Storage Security:** Treat localStorage data as untrusted on import. Always schema-validate before parsing.
4. **Referrer Policy:** Enforce \`rel="noopener noreferrer"\` on all external outgoing tabs.
5. **Autosave Debouncing:** Throttle client state persistence to avoid thread locking on rapid typing.`,
      tags: ['Security', 'Checklist', 'Best Practices'],
      isFavorite: true,
      createdAt: getRelativeDate(-7) + 'T12:00:00.000Z',
      updatedAt: now,
    },
  ];

  const bookmarks: Bookmark[] = [
    {
      id: 'bm_1',
      title: 'MDN Web Docs — Web Audio API',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API',
      category: 'Documentation',
      tags: ['Audio', 'WebAPI', 'Browser'],
      description: 'Comprehensive guide to synthesizing audio signals directly in client browsers.',
      createdAt: getRelativeDate(-10) + 'T10:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'bm_2',
      title: 'Tailwind CSS Documentation',
      url: 'https://tailwindcss.com/docs',
      category: 'Tools',
      tags: ['CSS', 'Styling', 'UI'],
      description: 'Utility-first CSS framework reference for layout and color tokens.',
      createdAt: getRelativeDate(-9) + 'T14:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'bm_3',
      title: 'React 19 Hooks and Architecture Guide',
      url: 'https://react.dev/reference/react',
      category: 'Articles',
      tags: ['React', 'Frontend', 'TypeScript'],
      description: 'Official API documentation for modern React hooks, actions, and performance patterns.',
      createdAt: getRelativeDate(-6) + 'T11:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'bm_4',
      title: 'PostgreSQL Index Types & Performance Tuning',
      url: 'https://www.postgresql.org/docs/current/indexes-types.html',
      category: 'Documentation',
      tags: ['Postgres', 'Database', 'Performance'],
      description: 'Overview of B-tree, Hash, GIN, and GiST indexes with query planner considerations.',
      createdAt: getRelativeDate(-5) + 'T16:00:00.000Z',
      updatedAt: now,
    },
  ];

  const focusSessions: FocusSession[] = [
    {
      id: 'sess_1',
      type: 'focus',
      durationMinutes: 25,
      completedAt: getRelativeDate(0) + 'T09:30:00.000Z',
      projectId: 'proj_cloudflow',
      taskId: 'task_1',
      notes: 'Investigated Redis query pipeline latency.',
    },
    {
      id: 'sess_2',
      type: 'focus',
      durationMinutes: 25,
      completedAt: getRelativeDate(0) + 'T11:00:00.000Z',
      projectId: 'proj_devflow',
      taskId: 'task_2',
      notes: 'Audited tab focus traps in modal dialogs.',
    },
    {
      id: 'sess_3',
      type: 'focus',
      durationMinutes: 25,
      completedAt: getRelativeDate(-1) + 'T14:00:00.000Z',
      projectId: 'proj_devflow',
      taskId: 'task_3',
      notes: 'Wrote deploy.yml GitHub Actions workflow.',
    },
    {
      id: 'sess_4',
      type: 'focus',
      durationMinutes: 25,
      completedAt: getRelativeDate(-1) + 'T15:30:00.000Z',
      projectId: 'proj_devflow',
      taskId: 'task_7',
      notes: 'Tested background timer reconciliation.',
    },
    {
      id: 'sess_5',
      type: 'focus',
      durationMinutes: 25,
      completedAt: getRelativeDate(-2) + 'T10:00:00.000Z',
      projectId: 'proj_cloudflow',
      notes: 'System architecture review and whiteboard.',
    },
  ];

  const activities: ActivityLog[] = [
    {
      id: 'act_1',
      actionType: 'focus_completed',
      entityType: 'session',
      entityTitle: '25m Focus Session on Redis Query Pipeline',
      timestamp: getRelativeDate(0) + 'T11:25:00.000Z',
    },
    {
      id: 'act_2',
      actionType: 'update',
      entityType: 'task',
      entityTitle: 'Audited WCAG 2.1 AA keyboard focus indicators',
      timestamp: getRelativeDate(0) + 'T10:15:00.000Z',
    },
    {
      id: 'act_3',
      actionType: 'complete',
      entityType: 'task',
      entityTitle: 'Set up GitHub Actions workflow for static Pages deploy',
      timestamp: getRelativeDate(-1) + 'T17:00:00.000Z',
    },
    {
      id: 'act_4',
      actionType: 'create',
      entityType: 'snippet',
      entityTitle: 'TypeScript Safe Exhaustive Switch Pattern',
      timestamp: getRelativeDate(-2) + 'T11:00:00.000Z',
    },
  ];

  return {
    projects,
    tasks,
    snippets,
    notes,
    bookmarks,
    focusSessions,
    activities,
    settings: DEFAULT_SETTINGS,
    isDemoData: true,
  };
}

export function loadWorkspaceData(): WorkspaceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const demoData = createInitialDemoData();
      saveWorkspaceData(demoData);
      return demoData;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      const demoData = createInitialDemoData();
      saveWorkspaceData(demoData);
      return demoData;
    }

    // Schema migration / fallback defaults
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      snippets: Array.isArray(parsed.snippets) ? parsed.snippets : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      focusSessions: Array.isArray(parsed.focusSessions) ? parsed.focusSessions : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      settings: parsed.settings && typeof parsed.settings === 'object'
        ? {
            ...DEFAULT_SETTINGS,
            ...parsed.settings,
            pomodoro: {
              ...DEFAULT_SETTINGS.pomodoro,
              ...(parsed.settings.pomodoro || {}),
            },
          }
        : DEFAULT_SETTINGS,
      isDemoData: Boolean(parsed.isDemoData),
    };
  } catch (err) {
    console.error('Failed to load DevFlow workspace from localStorage:', err);
    return createInitialDemoData();
  }
}

export function saveWorkspaceData(data: WorkspaceData): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to save DevFlow workspace to localStorage:', err);
    return false;
  }
}

export function clearDemoData(currentData: WorkspaceData): WorkspaceData {
  const cleaned: WorkspaceData = {
    projects: [],
    tasks: [],
    snippets: [],
    notes: [],
    bookmarks: [],
    focusSessions: [],
    activities: [
      {
        id: generateId('act'),
        actionType: 'delete',
        entityType: 'system',
        entityTitle: 'Sample demo data cleared by user',
        timestamp: new Date().toISOString(),
      },
    ],
    settings: currentData.settings,
    isDemoData: false,
  };
  saveWorkspaceData(cleaned);
  return cleaned;
}

export function resetToDemoData(): WorkspaceData {
  const demo = createInitialDemoData();
  saveWorkspaceData(demo);
  return demo;
}

export function exportWorkspaceJson(data: WorkspaceData): string {
  const exportPayload: WorkspaceData = {
    ...data,
    exportTimestamp: new Date().toISOString(),
  };
  return JSON.stringify(exportPayload, null, 2);
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  parsedData?: WorkspaceData;
  summary?: {
    projectsCount: number;
    tasksCount: number;
    snippetsCount: number;
    notesCount: number;
    bookmarksCount: number;
    sessionsCount: number;
  };
}

export function validateImportJson(jsonString: string): ImportValidationResult {
  const errors: string[] = [];

  if (!jsonString || typeof jsonString !== 'string') {
    return { isValid: false, errors: ['Import file is empty or invalid.'] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { isValid: false, errors: ['Invalid JSON syntax. Please verify file formatting.'] };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { isValid: false, errors: ['Imported JSON must be a valid root object.'] };
  }

  const obj = parsed as Record<string, unknown>;

  // Validate critical collections
  if (!('projects' in obj) || !Array.isArray(obj.projects)) {
    errors.push('Missing or invalid "projects" array.');
  }
  if (!('tasks' in obj) || !Array.isArray(obj.tasks)) {
    errors.push('Missing or invalid "tasks" array.');
  }
  if (!('snippets' in obj) || !Array.isArray(obj.snippets)) {
    errors.push('Missing or invalid "snippets" array.');
  }
  if (!('notes' in obj) || !Array.isArray(obj.notes)) {
    errors.push('Missing or invalid "notes" array.');
  }
  if (!('bookmarks' in obj) || !Array.isArray(obj.bookmarks)) {
    errors.push('Missing or invalid "bookmarks" array.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Deep validation of individual items
  const validProjects = (obj.projects as unknown[]).filter((p): p is Project => {
    return (
      Boolean(p) &&
      typeof p === 'object' &&
      typeof (p as Project).id === 'string' &&
      typeof (p as Project).name === 'string'
    );
  });

  const validTasks = (obj.tasks as unknown[]).filter((t): t is Task => {
    return (
      Boolean(t) &&
      typeof t === 'object' &&
      typeof (t as Task).id === 'string' &&
      typeof (t as Task).title === 'string'
    );
  });

  const validSnippets = (obj.snippets as unknown[]).filter((s): s is Snippet => {
    return (
      Boolean(s) &&
      typeof s === 'object' &&
      typeof (s as Snippet).id === 'string' &&
      typeof (s as Snippet).title === 'string'
    );
  });

  const validNotes = (obj.notes as unknown[]).filter((n): n is Note => {
    return (
      Boolean(n) &&
      typeof n === 'object' &&
      typeof (n as Note).id === 'string' &&
      typeof (n as Note).title === 'string'
    );
  });

  const validBookmarks = (obj.bookmarks as unknown[]).filter((b): b is Bookmark => {
    return (
      Boolean(b) &&
      typeof b === 'object' &&
      typeof (b as Bookmark).id === 'string' &&
      typeof (b as Bookmark).url === 'string'
    );
  });

  const validSessions = Array.isArray(obj.focusSessions)
    ? (obj.focusSessions as unknown[]).filter((fs): fs is FocusSession => {
        return (
          Boolean(fs) &&
          typeof fs === 'object' &&
          typeof (fs as FocusSession).id === 'string' &&
          typeof (fs as FocusSession).durationMinutes === 'number'
        );
      })
    : [];

  const validActivities = Array.isArray(obj.activities)
    ? (obj.activities as unknown[]).filter((a): a is ActivityLog => {
        return Boolean(a) && typeof a === 'object' && typeof (a as ActivityLog).id === 'string';
      })
    : [];

  const validatedData: WorkspaceData = {
    projects: validProjects,
    tasks: validTasks,
    snippets: validSnippets,
    notes: validNotes,
    bookmarks: validBookmarks,
    focusSessions: validSessions,
    activities: validActivities,
    settings: (obj.settings as AppSettings) || DEFAULT_SETTINGS,
    isDemoData: false,
  };

  return {
    isValid: true,
    errors: [],
    parsedData: validatedData,
    summary: {
      projectsCount: validProjects.length,
      tasksCount: validTasks.length,
      snippetsCount: validSnippets.length,
      notesCount: validNotes.length,
      bookmarksCount: validBookmarks.length,
      sessionsCount: validSessions.length,
    },
  };
}

export function calculateStorageUsage(): { usedBytes: number; usedKb: number; percentage: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const usedBytes = new Blob([raw]).size;
    const usedKb = Math.round((usedBytes / 1024) * 10) / 10;
    // Standard localStorage quota is typically ~5MB (5,242,880 bytes)
    const totalEstBytes = 5 * 1024 * 1024;
    const percentage = Math.min(100, Math.round((usedBytes / totalEstBytes) * 1000) / 10);
    return { usedBytes, usedKb, percentage };
  } catch {
    return { usedBytes: 0, usedKb: 0, percentage: 0 };
  }
}
