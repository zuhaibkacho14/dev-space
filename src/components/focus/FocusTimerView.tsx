import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { FocusSessionType } from '../../types';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Volume2,
  VolumeX,
  Briefcase,
  CheckSquare,
  Sparkles,
  Info,
} from 'lucide-react';

export const FocusTimerView: React.FC = () => {
  const {
    data,
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimerSession,
    setTimerSessionType,
    setTimerProject,
    setTimerTask,
    updatePomodoroSettings,
  } = useWorkspace();

  const {
    status,
    sessionType,
    remainingSeconds,
    totalDurationSeconds,
    selectedProjectId,
    selectedTaskId,
    completedFocusCount,
  } = timerState;

  // Format mm:ss
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate SVG circular progress
  const progressRatio = totalDurationSeconds > 0 ? (totalDurationSeconds - remainingSeconds) / totalDurationSeconds : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const sessionTitles: Record<FocusSessionType, string> = {
    focus: 'Deep Focus Session',
    short_break: 'Short Rest & Recharge',
    long_break: 'Extended Recovery Break',
  };

  const sessionColors: Record<FocusSessionType, { ring: string; badge: string; text: string }> = {
    focus: {
      ring: 'stroke-indigo-600 dark:stroke-indigo-500',
      badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
    short_break: {
      ring: 'stroke-emerald-600 dark:stroke-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    long_break: {
      ring: 'stroke-amber-600 dark:stroke-amber-500',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      text: 'text-amber-600 dark:text-amber-400',
    },
  };

  // Associated project's tasks filter
  const availableTasks = selectedProjectId
    ? data.tasks.filter((t) => t.projectId === selectedProjectId && t.status !== 'done')
    : data.tasks.filter((t) => t.status !== 'done');

  // Filter today's completed focus sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = data.focusSessions.filter(
    (s) => s.completedAt.startsWith(today) && s.type === 'focus'
  );
  const totalTodayMinutes = todaySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Timer className="w-6 h-6 text-indigo-500" />
            Focus Session & Pomodoro
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reconciles background time even when tabs are inactive. Logs real focus data to analytics.
          </p>
        </div>

        {/* Audio Toggle & Streak */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              Today: <strong className="font-semibold text-slate-900 dark:text-slate-100">{todaySessions.length}</strong> sessions ({totalTodayMinutes}m)
            </span>
          </div>

          <button
            onClick={() =>
              updatePomodoroSettings({
                soundEnabled: !data.settings.pomodoro.soundEnabled,
              })
            }
            title={data.settings.pomodoro.soundEnabled ? 'Mute Chime Sound' : 'Enable Chime Sound'}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
          >
            {data.settings.pomodoro.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 mb-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setTimerSessionType('focus')}
            disabled={status !== 'idle'}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              sessionType === 'focus'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50'
            }`}
          >
            Focus ({data.settings.pomodoro.focusDuration}m)
          </button>
          <button
            onClick={() => setTimerSessionType('short_break')}
            disabled={status !== 'idle'}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              sessionType === 'short_break'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50'
            }`}
          >
            Short Break ({data.settings.pomodoro.shortBreak}m)
          </button>
          <button
            onClick={() => setTimerSessionType('long_break')}
            disabled={status !== 'idle'}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              sessionType === 'long_break'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50'
            }`}
          >
            Long Break ({data.settings.pomodoro.longBreak}m)
          </button>
        </div>

        {/* Circular Progress Countdown */}
        <div className="relative flex items-center justify-center my-2">
          <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-100 dark:text-slate-700/60"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              className={`${sessionColors[sessionType].ring} transition-all duration-300`}
              fill="transparent"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>

          {/* Time text centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border mb-2 uppercase tracking-wider ${sessionColors[sessionType].badge}`}
            >
              {sessionTitles[sessionType]}
            </span>
            <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {timeDisplay}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
              {status === 'running' && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              {status === 'running' ? 'Active session' : status === 'paused' ? 'Paused' : 'Ready to start'}
            </div>
          </div>
        </div>

        {/* Interval Indicator */}
        <div className="flex items-center gap-1.5 my-6 text-xs text-slate-500 dark:text-slate-400">
          <span>Cycle:</span>
          {Array.from({ length: data.settings.pomodoro.longBreakInterval }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full border transition-colors ${
                idx < completedFocusCount % data.settings.pomodoro.longBreakInterval
                  ? 'bg-indigo-600 border-indigo-600 dark:bg-indigo-500'
                  : 'bg-transparent border-slate-300 dark:border-slate-600'
              }`}
              title={`Focus block ${idx + 1}`}
            />
          ))}
          <span className="ml-1 text-[11px]">
            ({data.settings.pomodoro.longBreakInterval - (completedFocusCount % data.settings.pomodoro.longBreakInterval)} left until long break)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {status === 'idle' ? (
            <button
              onClick={startTimer}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Focus
            </button>
          ) : status === 'running' ? (
            <button
              onClick={pauseTimer}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-all"
            >
              <Pause className="w-5 h-5 fill-current" />
              Pause
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              Resume
            </button>
          )}

          <button
            onClick={resetTimer}
            disabled={status === 'idle'}
            title="Reset Timer"
            className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={skipTimerSession}
            title="Skip Session"
            className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Association Selectors */}
        <div className="w-full max-w-lg mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              Link Project
            </label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setTimerProject(e.target.value || null)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">No Project (General Focus)</option>
              {data.projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
              Link Task
            </label>
            <select
              value={selectedTaskId || ''}
              onChange={(e) => setTimerTask(e.target.value || null)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="">No Specific Task</option>
              {availableTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ambient Info Pill */}
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
          <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span>
            The timer keeps accurate count across background tabs using system timestamp reconciliation.
          </span>
        </div>
      </div>

      {/* Recent Focus Activity Log */}
      <div className="rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Recent Focus Sessions ({data.focusSessions.length})
        </h3>

        {data.focusSessions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No completed focus sessions logged yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-750">
            {data.focusSessions.slice(0, 5).map((session) => {
              const proj = data.projects.find((p) => p.id === session.projectId);
              const task = data.tasks.find((t) => t.id === session.taskId);
              const dateFormatted = new Date(session.completedAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={session.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        session.type === 'focus'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {session.durationMinutes} min {session.type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {task ? task.title : proj ? proj.name : 'General Focus'}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{dateFormatted}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
