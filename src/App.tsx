import React, { useState } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { MobileNav } from './components/common/MobileNav';
import { DemoDataBanner } from './components/common/DemoDataBanner';
import { ToastContainer } from './components/common/ToastContainer';

// Feature Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsView } from './components/projects/ProjectsView';
import { TasksView } from './components/tasks/TasksView';
import { SnippetsView } from './components/snippets/SnippetsView';
import { NotesView } from './components/notes/NotesView';
import { BookmarksView } from './components/bookmarks/BookmarksView';
import { FocusTimerView } from './components/focus/FocusTimerView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { ProjectModal } from './components/projects/ProjectModal';
import { TaskModal } from './components/tasks/TaskModal';
import { SnippetModal } from './components/snippets/SnippetModal';
import { BookmarkModal } from './components/bookmarks/BookmarkModal';

import { Project, Task, Snippet } from './types';

const WorkspaceApp: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    addProject,
    updateProject,
    addTask,
    updateTask,
    addSnippet,
    updateSnippet,
    showToast,
  } = useWorkspace();

  // Global Modals State
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDefaultProjectId, setTaskDefaultProjectId] = useState<string | undefined>(undefined);

  const [snippetModalOpen, setSnippetModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);

  // Project Modal Handlers
  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleSaveProject = (
    projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
      showToast('Project updated', `"${projectData.name}" has been updated`, 'success');
    } else {
      addProject(projectData);
      showToast('Project created', `"${projectData.name}" is now tracking`, 'success');
    }
    setProjectModalOpen(false);
  };

  // Task Modal Handlers
  const handleOpenCreateTask = (projectId?: string) => {
    setEditingTask(null);
    setTaskDefaultProjectId(projectId);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDefaultProjectId(task.projectId);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      showToast('Task updated', `"${taskData.title}" updated`, 'success');
    } else {
      addTask(taskData);
      showToast('Task created', `"${taskData.title}" added to queue`, 'success');
    }
    setTaskModalOpen(false);
  };

  // Snippet Modal Handlers
  const handleOpenCreateSnippet = () => {
    setEditingSnippet(null);
    setSnippetModalOpen(true);
  };

  const handleEditSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setSnippetModalOpen(true);
  };

  const handleSaveSnippet = (
    snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingSnippet) {
      updateSnippet(editingSnippet.id, snippetData);
      showToast('Snippet updated', `"${snippetData.title}" updated`, 'success');
    } else {
      addSnippet(snippetData);
      showToast('Snippet saved', `"${snippetData.title}" added to library`, 'success');
    }
    setSnippetModalOpen(false);
  };

  // Render the view corresponding to currentTab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenTaskModal={() => handleOpenCreateTask()}
            onOpenProjectModal={handleOpenCreateProject}
            onOpenSnippetModal={handleOpenCreateSnippet}
            onOpenNoteModal={() => setCurrentTab('notes')}
            onSelectTask={handleEditTask}
          />
        );
      case 'projects':
        return (
          <ProjectsView
            onOpenCreateModal={handleOpenCreateProject}
            onEditProject={handleEditProject}
            onSelectTask={handleEditTask}
            onAddTaskToProject={(projectId) => handleOpenCreateTask(projectId)}
          />
        );
      case 'tasks':
        return (
          <TasksView
            onOpenCreateModal={() => handleOpenCreateTask()}
            onEditTask={handleEditTask}
          />
        );
      case 'snippets':
        return (
          <SnippetsView
            onOpenCreateModal={handleOpenCreateSnippet}
            onEditSnippet={handleEditSnippet}
          />
        );
      case 'notes':
        return <NotesView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'focus':
        return <FocusTimerView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onOpenTaskModal={() => handleOpenCreateTask()}
            onOpenProjectModal={handleOpenCreateProject}
            onOpenSnippetModal={handleOpenCreateSnippet}
            onOpenNoteModal={() => setCurrentTab('notes')}
            onSelectTask={handleEditTask}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Desktop Collapsible Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Demo Data Banner if sample records are loaded */}
        <DemoDataBanner />

        {/* Global Application Header */}
        <Header
          onQuickCreateTask={() => handleOpenCreateTask()}
          onQuickCreateProject={handleOpenCreateProject}
          onQuickCreateSnippet={handleOpenCreateSnippet}
          onQuickCreateNote={() => setCurrentTab('notes')}
        />

        {/* Scrollable View Content Canvas */}
        <main
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 md:pb-12 focus:outline-none"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto">{renderTabContent()}</div>
        </main>

        {/* Mobile Navigation Bar and slide drawer */}
        <MobileNav />
      </div>

      {/* Global Interactive Modals */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleSaveProject}
        initialProject={editingProject}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultProjectId={taskDefaultProjectId}
      />

      <SnippetModal
        isOpen={snippetModalOpen}
        onClose={() => setSnippetModalOpen(false)}
        onSave={handleSaveSnippet}
        initialSnippet={editingSnippet}
      />

      <BookmarkModal
        isOpen={bookmarkModalOpen}
        onClose={() => setBookmarkModalOpen(false)}
      />

      {/* Toast Notification Layer */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceApp />
    </WorkspaceProvider>
  );
}
