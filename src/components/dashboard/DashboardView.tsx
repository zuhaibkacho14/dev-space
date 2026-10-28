import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  ArrowRight,
  Plus,
  CheckCircle2,
  Activity,
  Code2,
  FileText,
} from 'lucide-react';
import { Task } from '../../types';

interface DashboardViewProps {
  onOpenTaskModal: () => void;
  onOpenProjectModal: () => void;
  onOpenSnippetModal: () => void;
  onOpenNoteModal: () => void;
  onSelectTask: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenTaskModal,
  onOpenProjectModal,
  onOpenSnippetModal,
  onOpenNoteModal,
  onSelectTask,
}) => {
  const { data, setCurrentTab, moveTask } = useWorkspace();
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d'>('7d');

  // Filter tasks based on actual data
  const activeProjects = useMemo(
    () => data.projects.filter((p) => p.status === 'in_progress'),
    [data.projects]
  );

  const openTasks = useMemo(
    () => data.tasks.filter((t) => t.status !== 'done'),
    [data.tasks]
  );

  const completedTasks = useMemo(
    () => data.tasks.filter((t) => t.status === 'done'),
    [data.tasks]
  );

  // Total focus time in hours & minutes
  const totalFocusMinutes = useMemo(
    () => data.focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0),
    [data.focusSessions]
  );
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusRemainingMins = totalFocusMinutes % 60;

  // Today's priorities (Urgent or High, not completed)
  const todayPriorities = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return data.tasks
      .filter((t) => {
        if (t.status === 'done') return false;
        if (t.dueDate === today) return true;
        if (t.priority === 'urgent' || t.priority === 'high') return true;
        return false;
      })
      .slice(0, 5);
  }, [data.tasks]);

  // Upcoming deadlines (Tasks with due dates in future or today, not done, sorted by due date)
  const upcomingDeadlines = useMemo(() => {
    return data.tasks
      .filter((t) => t.status !== 'done' && t.dueDate)
      .sort((a, b) => (a.dueDate! > b.dueDate! ? 1 : -1))
      .slice(0, 5);
  }, [data.tasks]);

  // Compute daily task completion data for chart based on selected dateRange
  const daysCount = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;

  const chartData = useMemo(() => {
    const result: { dateStr: string; label: string; count: number }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const shortLabel = d.toLocaleDateString(undefined, {
        month: 'numeric',
        day: 'numeric',
      });

      // Count tasks completed on this date
      const count = data.tasks.filter((t) => {
        if (t.status !== 'done') return false;
        const taskDate = t.updatedAt.split('T')[0];
        return taskDate === isoDate;
      }).length;

      result.push({ dateStr: isoDate, label: shortLabel, count });
    }
    return result;
  }, [data.tasks, daysCount]);

  const maxChartCount = Math.max(1, ...chartData.map((d) => d.count));

  // Priority distribution counts
  const priorityCounts = useMemo(() => {
    const counts = { urgent: 0, high: 0, medium: 0, low: 0 };
    openTasks.forEach((t) => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return counts;
  }, [openTasks]);

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Projects */}
        <div
          onClick={() => setCurrentTab('projects')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2 font-mono">
            {activeProjects.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
            <span>{data.projects.length} total projects</span>
          </div>
        </div>

        {/* Open Tasks */}
        <div
          onClick={() => setCurrentTab('tasks')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Open Tasks</span>
            <CheckSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2 font-mono">
            {openTasks.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
            <span className="text-amber-400 font-medium">
              {data.tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').length} urgent
            </span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div
          onClick={() => setCurrentTab('tasks')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Completed Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2 font-mono">
            {completedTasks.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
            <span>
              {data.tasks.length > 0
                ? `${Math.round((completedTasks.length / data.tasks.length) * 100)}% completion rate`
                : 'No tasks created yet'}
            </span>
          </div>
        </div>

        {/* Tracked Focus Time */}
        <div
          onClick={() => setCurrentTab('focus')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Tracked Focus</span>
            <Clock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2 font-mono">
            {focusHours}h {focusRemainingMins}m
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
            <span>{data.focusSessions.length} sessions completed</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Today's Priorities */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Productivity Chart (8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Velocity & Task Completions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tasks marked Done over the selected timeframe
              </p>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['7d', '14d', '30d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    dateRange === r
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Responsive SVG Histogram / Line Chart */}
          <div className="w-full h-52 flex items-end gap-1.5 sm:gap-3 pt-6 pb-2 px-2 overflow-x-auto">
            {chartData.map((d) => {
              const heightPercent = maxChartCount > 0 ? (d.count / maxChartCount) * 100 : 0;
              return (
                <div
                  key={d.dateStr}
                  className="flex-1 flex flex-col items-center justify-end h-full min-w-[20px] group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-slate-100 px-2 py-0.5 rounded text-[10px] font-mono pointer-events-none whitespace-nowrap z-10 border border-slate-700 shadow-md">
                    {d.count} completed ({d.label})
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full max-w-[24px] rounded-t-md transition-all duration-300 bg-indigo-600/80 group-hover:bg-indigo-500"
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                  />

                  {/* Date label */}
                  <span className="text-[10px] font-mono text-slate-500 mt-2 truncate max-w-full">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Accessible textual summary for screen readers */}
          <div className="sr-only">
            {chartData.map((d) => `${d.label}: ${d.count} tasks completed`).join(', ')}
          </div>
        </div>

        {/* Priority Breakdown Card (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Open Tasks by Priority</h3>
            <p className="text-xs text-slate-400 mb-5">Current workload distribution</p>

            <div className="space-y-3">
              {[
                { label: 'Urgent', count: priorityCounts.urgent, color: 'bg-rose-500', text: 'text-rose-400' },
                { label: 'High', count: priorityCounts.high, color: 'bg-amber-500', text: 'text-amber-400' },
                { label: 'Medium', count: priorityCounts.medium, color: 'bg-indigo-500', text: 'text-indigo-400' },
                { label: 'Low', count: priorityCounts.low, color: 'bg-slate-500', text: 'text-slate-400' },
              ].map((p) => {
                const total = Math.max(1, openTasks.length);
                const percent = Math.round((p.count / total) * 100);

                return (
                  <div key={p.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-medium ${p.text}`}>{p.label}</span>
                      <span className="font-mono text-slate-400">
                        {p.count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${p.color}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('tasks')}
            className="mt-6 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition"
          >
            <span>Open Task Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Secondary Grid: Today's Priorities & Upcoming Deadlines */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Priorities */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-100">Today's Focus & Priorities</h3>
            </div>
            <button
              onClick={onOpenTaskModal}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>

          {todayPriorities.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
              No urgent tasks pending for today. Clear skies ahead! 🚀
            </div>
          ) : (
            <div className="space-y-2">
              {todayPriorities.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => moveTask(task.id, 'done')}
                      className="w-4 h-4 rounded border border-slate-600 hover:border-emerald-500 hover:bg-emerald-500/20 shrink-0 flex items-center justify-center transition"
                      aria-label="Mark task done"
                    />
                    <div
                      className="cursor-pointer truncate"
                      onClick={() => onSelectTask(task)}
                    >
                      <h4 className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition truncate">
                        {task.title}
                      </h4>
                      {task.dueDate && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          Due: {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold shrink-0 ${
                      task.priority === 'urgent'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-100">Upcoming Deadlines</h3>
            </div>
            <button
              onClick={() => setCurrentTab('tasks')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
              No tasks with scheduled deadlines.
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((task) => {
                const today = new Date().toISOString().split('T')[0];
                const isOverdue = task.dueDate! < today;
                const isToday = task.dueDate! === today;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 transition truncate">
                        {task.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        Status: {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          isOverdue
                            ? 'bg-rose-500/20 text-rose-400'
                            : isToday
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isOverdue ? 'Overdue' : isToday ? 'Due Today' : task.dueDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Launch & Recent Activity */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Quick Create Buttons Bar (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">Quick Actions</h3>
          <p className="text-xs text-slate-400">Fast shortcuts to capture ideas and work</p>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onOpenTaskModal}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs font-medium transition"
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>+ New Task</span>
            </button>
            <button
              onClick={onOpenProjectModal}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs font-medium transition"
            >
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              <span>+ Project</span>
            </button>
            <button
              onClick={onOpenSnippetModal}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs font-medium transition"
            >
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>+ Snippet</span>
            </button>
            <button
              onClick={onOpenNoteModal}
              className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs font-medium transition"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>+ Note</span>
            </button>
          </div>
        </div>

        {/* Real Activity Stream (8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-100">Recent Workspace Activity</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Live Audit Trail</span>
          </div>

          {data.activities.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
              No recent activity recorded.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {data.activities.slice(0, 6).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-950/40 border border-slate-800/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        act.actionType === 'create'
                          ? 'bg-emerald-400'
                          : act.actionType === 'complete'
                          ? 'bg-cyan-400'
                          : act.actionType === 'delete'
                          ? 'bg-rose-400'
                          : 'bg-indigo-400'
                      }`}
                    />
                    <span className="text-slate-300 font-medium truncate">
                      {act.entityTitle}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-800 shrink-0">
                      {act.actionType}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-2">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
