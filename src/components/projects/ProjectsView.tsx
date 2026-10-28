import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  FolderKanban,
  CheckCircle2,
  Clock,
  Calendar,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { Project, ProjectStatus, Task } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

interface ProjectsViewProps {
  onOpenCreateModal: () => void;
  onEditProject: (project: Project) => void;
  onSelectTask: (task: Task) => void;
  onAddTaskToProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onOpenCreateModal,
  onEditProject,
  onSelectTask,
  onAddTaskToProject,
}) => {
  const { data, deleteProject, moveTask } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'name' | 'progress' | 'created'>('deadline');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Project deletion state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteTasksOption, setDeleteTasksOption] = useState<boolean>(false);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return data.projects
      .filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'created') return b.createdAt.localeCompare(a.createdAt);
        if (sortBy === 'progress') {
          const aTasks = data.tasks.filter((t) => t.projectId === a.id);
          const bTasks = data.tasks.filter((t) => t.projectId === b.id);
          const aProg = aTasks.length > 0 ? aTasks.filter((t) => t.status === 'done').length / aTasks.length : 0;
          const bProg = bTasks.length > 0 ? bTasks.filter((t) => t.status === 'done').length / bTasks.length : 0;
          return bProg - aProg;
        }
        return a.deadline.localeCompare(b.deadline);
      });
  }, [data.projects, data.tasks, statusFilter, searchQuery, sortBy]);

  // Selected project details
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return data.projects.find((p) => p.id === selectedProjectId) || null;
  }, [data.projects, selectedProjectId]);

  const selectedProjectTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return data.tasks.filter((t) => t.projectId === selectedProjectId);
  }, [data.tasks, selectedProjectId]);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">IN PROGRESS</span>;
      case 'planned':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">PLANNED</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">COMPLETED</span>;
      case 'on_hold':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">ON HOLD</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Search, Filters, Sort, Add Project */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ProjectStatus)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:border-indigo-500 focus:outline-none transition shrink-0"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Menu */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none text-xs"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="name">Sort: Name</option>
              <option value="progress">Sort: Progress</option>
              <option value="created">Sort: Newest</option>
            </select>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-900/30 transition hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={searchQuery ? 'No matching projects found' : 'No projects created yet'}
          description={
            searchQuery
              ? 'Try adjusting your search query or status filter.'
              : 'Create your first project to organize tasks, calculate real progress, and track deadlines.'
          }
          actionLabel={searchQuery ? undefined : 'Create First Project'}
          onAction={searchQuery ? undefined : onOpenCreateModal}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const projectTasks = data.tasks.filter((t) => t.projectId === project.id);
            const doneTasks = projectTasks.filter((t) => t.status === 'done');
            const progress = projectTasks.length > 0 ? Math.round((doneTasks.length / projectTasks.length) * 100) : 0;

            const today = new Date().toISOString().split('T')[0];
            const isOverdue = project.deadline < today && project.status !== 'completed';

            return (
              <div
                key={project.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Accent Top Border */}
                <div
                  className="absolute top-0 inset-x-0 h-1"
                  style={{ backgroundColor: project.color }}
                />

                <div>
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      onClick={() => setSelectedProjectId(project.id)}
                      className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition cursor-pointer truncate"
                    >
                      {project.name}
                    </span>
                    {getStatusBadge(project.status)}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress Bar derived from actual tasks */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400 font-medium">Task Completion</span>
                      <span className="font-mono font-semibold text-slate-300">
                        {doneTasks.length}/{projectTasks.length} ({progress}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Dates & Metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span className={isOverdue ? 'text-rose-400 font-bold' : ''}>
                        {project.deadline}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-indigo-400 p-1 rounded hover:bg-slate-800 transition"
                          title="Open Repository"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => onEditProject(project)}
                        className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setProjectToDelete(project);
                          setDeleteTasksOption(false);
                        }}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Detail Slide-over Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="fixed inset-0" onClick={() => setSelectedProjectId(null)} />
          <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 z-10">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: selectedProject.color }}
                  />
                  <h2 className="text-base font-bold text-slate-100">{selectedProject.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedProject.description || 'No description provided.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400 font-mono">
                  <span>Start: {selectedProject.startDate}</span>
                  <span>Deadline: {selectedProject.deadline}</span>
                  {getStatusBadge(selectedProject.status)}
                </div>
              </div>

              {/* Associated Tasks */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Associated Tasks ({selectedProjectTasks.length})
                  </h3>
                  <button
                    onClick={() => {
                      onAddTaskToProject(selectedProject.id);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Task
                  </button>
                </div>

                {selectedProjectTasks.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
                    No tasks assigned to this project yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedProjectTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() =>
                              moveTask(task.id, task.status === 'done' ? 'todo' : 'done')
                            }
                            className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border transition ${
                              task.status === 'done'
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-600 hover:border-emerald-500'
                            }`}
                          >
                            {task.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                          <span
                            onClick={() => {
                              setSelectedProjectId(null);
                              onSelectTask(task);
                            }}
                            className={`text-xs truncate cursor-pointer hover:text-indigo-400 transition ${
                              task.status === 'done'
                                ? 'line-through text-slate-500'
                                : 'text-slate-200'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${
                            task.priority === 'urgent'
                              ? 'bg-rose-500/20 text-rose-400'
                              : task.priority === 'high'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => onEditProject(selectedProject)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                Edit Project
              </button>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Dialog with Explicit Data Choice */}
      {projectToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setProjectToDelete(null)}
          onConfirm={() => {
            deleteProject(projectToDelete.id, deleteTasksOption);
            if (selectedProjectId === projectToDelete.id) {
              setSelectedProjectId(null);
            }
          }}
          title={`Delete Project "${projectToDelete.name}"?`}
          message="Deleting a project removes its roadmap and configuration. Please specify how associated tasks should be handled:"
          confirmLabel="Delete Project"
          isDestructive={true}
          extraOptions={
            <div className="space-y-2.5 text-xs text-slate-300">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="deleteOption"
                  checked={!deleteTasksOption}
                  onChange={() => setDeleteTasksOption(false)}
                  className="mt-0.5 accent-indigo-600"
                />
                <div>
                  <span className="font-semibold text-slate-200 block">
                    Keep tasks (Recommended)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Tasks will be preserved and reassigned to "Unassigned Project".
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="deleteOption"
                  checked={deleteTasksOption}
                  onChange={() => setDeleteTasksOption(true)}
                  className="mt-0.5 accent-rose-600"
                />
                <div>
                  <span className="font-semibold text-rose-300 block">
                    Delete all associated tasks
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Permanently removes all {data.tasks.filter((t) => t.projectId === projectToDelete.id).length} tasks linked to this project.
                  </span>
                </div>
              </label>
            </div>
          }
        />
      )}
    </div>
  );
};
