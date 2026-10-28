import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  PieChart as PieIcon,
  TrendingUp,
  FolderGit2,
} from 'lucide-react';

type TimeRange = '7d' | '14d' | '30d' | 'all';

export const AnalyticsView: React.FC = () => {
  const { data } = useWorkspace();
  const [timeRange, setTimeRange] = useState<TimeRange>('14d');

  // Compute cutoff timestamp based on selected timeRange
  const cutoffDate = useMemo(() => {
    if (timeRange === 'all') return new Date(0);
    const d = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [timeRange]);

  // Filter tasks created or completed within range
  const relevantTasks = useMemo(() => {
    return data.tasks.filter((t) => {
      const updated = new Date(t.updatedAt);
      return updated >= cutoffDate;
    });
  }, [data.tasks, cutoffDate]);

  // Filter focus sessions within range
  const relevantSessions = useMemo(() => {
    return data.focusSessions.filter((s) => {
      const completed = new Date(s.completedAt);
      return completed >= cutoffDate && s.type === 'focus';
    });
  }, [data.focusSessions, cutoffDate]);

  // Key KPI calculations
  const totalTasks = data.tasks.length;
  const completedTasksCount = data.tasks.filter((t) => t.status === 'done').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const totalFocusMinutes = relevantSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Group focus time by Day for the SVG bar chart
  const dailyFocusMap = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : 14;
    const result: { dateStr: string; label: string; minutes: number; dayName: string }[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' });

      const dayMinutes = relevantSessions
        .filter((s) => s.completedAt.startsWith(dateStr))
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      result.push({ dateStr, label, minutes: dayMinutes, dayName });
    }

    return result;
  }, [relevantSessions, timeRange]);

  const maxDailyMinutes = Math.max(...dailyFocusMap.map((d) => d.minutes), 60);

  // Focus time grouped by project
  const projectFocusBreakdown = useMemo(() => {
    const map = new Map<string, number>();

    relevantSessions.forEach((s) => {
      const key = s.projectId || 'unassigned';
      map.set(key, (map.get(key) || 0) + s.durationMinutes);
    });

    return Array.from(map.entries())
      .map(([projectId, minutes]) => {
        const proj = data.projects.find((p) => p.id === projectId);
        return {
          id: projectId,
          name: proj ? proj.name : 'General (Unassigned)',
          color: proj ? proj.color : '#94a3b8',
          minutes,
          percentage: totalFocusMinutes > 0 ? Math.round((minutes / totalFocusMinutes) * 100) : 0,
        };
      })
      .sort((a, b) => b.minutes - a.minutes);
  }, [relevantSessions, data.projects, totalFocusMinutes]);

  // Tasks by priority breakdown
  const priorityBreakdown = useMemo(() => {
    const counts = { urgent: 0, high: 0, medium: 0, low: 0 };
    data.tasks.forEach((t) => {
      if (counts[t.priority] !== undefined) {
        counts[t.priority]++;
      }
    });
    return [
      { label: 'Urgent', count: counts.urgent, color: '#ef4444' },
      { label: 'High', count: counts.high, color: '#f97316' },
      { label: 'Medium', count: counts.medium, color: '#eab308' },
      { label: 'Low', count: counts.low, color: '#10b981' },
    ];
  }, [data.tasks]);

  return (
    <div className="space-y-6">
      {/* Header & Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Productivity Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real metrics derived from your actual projects, tasks, and completed focus sessions.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          {(['7d', '14d', '30d', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                timeRange === range
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {range === 'all' ? 'All Time' : `Last ${range.replace('d', ' Days')}`}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completion Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {taskCompletionRate}%
            </span>
            <span className="text-xs text-slate-400">
              ({completedTasksCount}/{totalTasks} tasks)
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Focus Time Tracked
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {totalFocusHours}h
            </span>
            <span className="text-xs text-slate-400">({totalFocusMinutes} minutes)</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Across {relevantSessions.length} completed focus blocks
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Focus Sessions
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {relevantSessions.length}
            </span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Avg {relevantSessions.length > 0 ? Math.round(totalFocusMinutes / relevantSessions.length) : 0} min / block
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Projects
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {data.projects.filter((p) => p.status === 'in_progress').length}
            </span>
            <span className="text-xs text-slate-400">in progress</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {data.projects.length} total registered projects
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Focus Time Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Daily Focus Activity
              </h2>
              <span className="text-xs text-slate-400">Minutes per day</span>
            </div>

            {/* SVG Responsive Bar Chart */}
            <div className="h-60 w-full flex items-end gap-1.5 pt-6 pb-2 border-b border-slate-200 dark:border-slate-700">
              {dailyFocusMap.map((d, index) => {
                const heightPercent = maxDailyMinutes > 0 ? (d.minutes / maxDailyMinutes) * 100 : 0;
                const isToday = index === dailyFocusMap.length - 1;

                return (
                  <div
                    key={d.dateStr}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap z-10">
                      {d.label}: {d.minutes} mins
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full max-w-[28px] rounded-t transition-all duration-300 ${
                        isToday
                          ? 'bg-indigo-600 dark:bg-indigo-500'
                          : d.minutes > 0
                          ? 'bg-indigo-400 dark:bg-indigo-600/70 group-hover:bg-indigo-500'
                          : 'bg-slate-100 dark:bg-slate-700/40'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400">
              <span>{dailyFocusMap[0]?.label}</span>
              <span>{dailyFocusMap[Math.floor(dailyFocusMap.length / 2)]?.label}</span>
              <span>Today ({dailyFocusMap[dailyFocusMap.length - 1]?.label})</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Day: {Math.max(...dailyFocusMap.map((d) => d.minutes))} mins</span>
            <span>Total: {totalFocusMinutes} mins</span>
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="p-6 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-500" />
                Tasks by Priority
              </h2>
              <span className="text-xs text-slate-400">{data.tasks.length} total</span>
            </div>

            <div className="space-y-3 mt-4">
              {priorityBreakdown.map((p) => {
                const percent = data.tasks.length > 0 ? Math.round((p.count / data.tasks.length) * 100) : 0;
                return (
                  <div key={p.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        {p.label}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {p.count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: p.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Prioritize completing <strong>Urgent</strong> tasks before moving to lower priority items.
          </div>
        </div>
      </div>

      {/* Focus Breakdown by Project */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-indigo-500" />
          Focus Time Invested by Project
        </h2>

        {projectFocusBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No project focus sessions recorded in this timeframe.</p>
        ) : (
          <div className="space-y-4">
            {projectFocusBreakdown.map((item) => (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-md"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {item.minutes} mins ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
