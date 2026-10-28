import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Plus,
  Search,
  Kanban,
  List,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  CheckSquare,
  MoreVertical,
  Filter,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

interface TasksViewProps {
  onOpenCreateModal: () => void;
  onEditTask: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'border-slate-700' },
  { id: 'todo', label: 'To Do', color: 'border-indigo-500/40' },
  { id: 'in_progress', label: 'In Progress', color: 'border-amber-500/40' },
  { id: 'done', label: 'Done', color: 'border-emerald-500/40' },
];

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenCreateModal,
  onEditTask,
}) => {
  const { data, moveTask, deleteTask } = useWorkspace();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Dragging state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<TaskStatus | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return data.tasks.filter((t) => {
      // Quick filter
      if (quickFilter === 'completed' && t.status !== 'done') return false;
      if (quickFilter === 'today') {
        if (t.status === 'done' || t.dueDate !== todayStr) return false;
      }
      if (quickFilter === 'upcoming') {
        if (t.status === 'done' || !t.dueDate || t.dueDate <= todayStr) return false;
      }
      if (quickFilter === 'overdue') {
        if (t.status === 'done' || !t.dueDate || t.dueDate >= todayStr) return false;
      }

      // Project filter
      if (projectFilter !== 'all') {
        if (projectFilter === 'unassigned' && t.projectId) return false;
        if (projectFilter !== 'unassigned' && t.projectId !== projectFilter) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = t.description.toLowerCase().includes(q);
        const matchesTag = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      return true;
    });
  }, [data.tasks, quickFilter, projectFilter, priorityFilter, searchQuery, todayStr]);

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400">URGENT</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-500/20 text-indigo-300">MED</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400">LOW</span>;
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTask(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setActiveDropColumn(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and View Switcher Bar */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Quick Filter Tabs & View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Filters */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'today', label: "Today's" },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'completed', label: 'Completed' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setQuickFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  quickFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* View Mode & Add Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'kanban'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Kanban Board View"
                aria-label="Kanban Board View"
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List Table View"
                aria-label="List Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-900/30 transition hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search Query, Project Filter, Priority Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks by title, description, or #tag..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:border-indigo-500 focus:outline-none transition"
          >
            <option value="all">All Projects</option>
            <option value="unassigned">Unassigned Project</option>
            {data.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:border-indigo-500 focus:outline-none transition"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task Content: Kanban Board vs List View */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={searchQuery ? 'No matching tasks' : 'No tasks in this view'}
          description={
            searchQuery
              ? 'Try adjusting your search keywords or clearing active filters.'
              : 'Add tasks to organize feature roadmaps, bug fixes, or sprint items.'
          }
          actionLabel={searchQuery ? undefined : 'Create a Task'}
          onAction={searchQuery ? undefined : onOpenCreateModal}
        />
      ) : viewMode === 'kanban' ? (
        /* ========================================================== */
        /* KANBAN BOARD VIEW                                         */
        /* ========================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const isDropTarget = activeDropColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`p-3.5 rounded-2xl bg-slate-900/90 border transition-all min-h-[450px] flex flex-col ${
                  isDropTarget ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800/80'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{col.label}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={onOpenCreateModal}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 transition"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Task Cards Column */}
                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => {
                    const project = data.projects.find((p) => p.id === task.projectId);
                    const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'done';
                    const isDueToday = task.dueDate && task.dueDate === todayStr;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 shadow-sm transition group cursor-grab active:cursor-grabbing relative"
                      >
                        {/* Project Indicator Pill & Priority */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {project ? (
                            <span
                              className="inline-flex items-center gap-1.5 text-[10px] font-medium truncate max-w-[140px]"
                              style={{ color: project.color }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="truncate">{project.name}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium">Unassigned</span>
                          )}

                          {getPriorityBadge(task.priority)}
                        </div>

                        {/* Title */}
                        <h4
                          onClick={() => onEditTask(task)}
                          className={`text-xs font-semibold leading-snug cursor-pointer hover:text-indigo-300 transition ${
                            task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Description Preview */}
                        {task.description && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer: Due date & Actions */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                          {task.dueDate ? (
                            <div className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                              <span
                                className={
                                  isOverdue
                                    ? 'text-rose-400 font-bold'
                                    : isDueToday
                                    ? 'text-amber-400 font-bold'
                                    : 'text-slate-400'
                                }
                              >
                                {isOverdue ? 'Overdue' : isDueToday ? 'Today' : task.dueDate}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600 text-[10px]">No date</span>
                          )}

                          <div className="flex items-center gap-1">
                            {/* Accessible Keyboard Move Menu (for touch/keyboard navigation) */}
                            <select
                              value={task.status}
                              onChange={(e) => moveTask(task.id, e.target.value as TaskStatus)}
                              className="text-[10px] font-mono bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-400 focus:outline-none"
                              title="Move column"
                              aria-label={`Move task ${task.title}`}
                            >
                              <option value="backlog">Backlog</option>
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Prog</option>
                              <option value="done">Done</option>
                            </select>

                            <button
                              onClick={() => onEditTask(task)}
                              className="p-1 rounded text-slate-400 hover:text-slate-200 transition"
                              title="Edit task"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setTaskToDelete(task)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================== */
        /* LIST TABLE VIEW                                           */
        /* ========================================================== */
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3 w-8">Status</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Tags</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTasks.map((task) => {
                const project = data.projects.find((p) => p.id === task.projectId);
                const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'done';

                return (
                  <tr key={task.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <button
                        onClick={() =>
                          moveTask(task.id, task.status === 'done' ? 'todo' : 'done')
                        }
                        className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                          task.status === 'done'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-600 hover:border-emerald-500'
                        }`}
                        aria-label="Toggle task completion"
                      >
                        {task.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        onClick={() => onEditTask(task)}
                        className={`font-semibold cursor-pointer hover:text-indigo-400 transition ${
                          task.status === 'done' ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {project ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium"
                          style={{ color: project.color }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3">{getPriorityBadge(task.priority)}</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {task.dueDate ? (
                        <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {task.dueDate}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={task.status}
                          onChange={(e) => moveTask(task.id, e.target.value as TaskStatus)}
                          className="text-[10px] font-mono bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-slate-300"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1 rounded text-slate-400 hover:text-slate-200"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Task Confirmation Dialog */}
      {taskToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setTaskToDelete(null)}
          onConfirm={() => deleteTask(taskToDelete.id)}
          title={`Delete Task "${taskToDelete.title}"?`}
          message="Are you sure you want to permanently delete this task? This action cannot be undone."
          confirmLabel="Delete Task"
          isDestructive={true}
        />
      )}
    </div>
  );
};
