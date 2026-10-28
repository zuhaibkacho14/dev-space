import React, { useState, useMemo } from 'react';
import { Bookmark, BookmarkCategory } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { BookmarkModal } from './BookmarkModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { getDomainFromUrl } from '../../services/urlValidator';
import {
  Bookmark as BookmarkIcon,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Copy,
  Check,
  Tag,
  FolderGit2,
  BookOpen,
  FileText,
  Wrench,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES: { label: string; value: BookmarkCategory | 'all'; icon: React.FC<{ className?: string }> }[] = [
  { label: 'All', value: 'all', icon: BookmarkIcon },
  { label: 'Documentation', value: 'Documentation', icon: BookOpen },
  { label: 'GitHub', value: 'GitHub', icon: FolderGit2 },
  { label: 'Articles', value: 'Articles', icon: FileText },
  { label: 'Tools', value: 'Tools', icon: Wrench },
  { label: 'Inspiration', value: 'Inspiration', icon: Sparkles },
  { label: 'Other', value: 'Other', icon: HelpCircle },
];

export const BookmarksView: React.FC = () => {
  const { data, deleteBookmark, showToast } = useWorkspace();
  const [selectedCategory, setSelectedCategory] = useState<BookmarkCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [deletingBookmark, setDeletingBookmark] = useState<Bookmark | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredBookmarks = useMemo(() => {
    return data.bookmarks.filter((bm) => {
      const matchesCategory = selectedCategory === 'all' || bm.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = bm.title.toLowerCase().includes(q);
      const inDesc = bm.description?.toLowerCase().includes(q);
      const inUrl = bm.url.toLowerCase().includes(q);
      const inTags = bm.tags?.some((t) => t.toLowerCase().includes(q));

      return inTitle || inDesc || inUrl || inTags;
    });
  }, [data.bookmarks, selectedCategory, searchQuery]);

  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      showToast('Copied', 'URL copied to clipboard', 'info', 2000);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Copy Failed', 'Unable to copy to clipboard', 'error');
    }
  };

  const handleConfirmDelete = () => {
    if (deletingBookmark) {
      deleteBookmark(deletingBookmark.id);
      showToast('Deleted', `Bookmark "${deletingBookmark.title}" removed`, 'info');
      setDeletingBookmark(null);
    }
  };

  const getCategoryBadgeClass = (category: BookmarkCategory) => {
    switch (category) {
      case 'Documentation':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'GitHub':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900';
      case 'Articles':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'Tools':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
      case 'Inspiration':
        return 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-900';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookmarkIcon className="w-6 h-6 text-indigo-500" />
            Developer Bookmarks
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Curate essential API docs, GitHub repositories, tools, and technical references.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBookmark(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Bookmark
        </button>
      </div>

      {/* Category Pills & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count =
              cat.value === 'all'
                ? data.bookmarks.length
                : data.bookmarks.filter((b) => b.category === cat.value).length;
            const isSelected = selectedCategory === cat.value;

            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-indigo-700 text-indigo-100'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <EmptyState
          icon={BookmarkIcon}
          title={searchQuery ? 'No bookmarks match your search' : 'No bookmarks in this category'}
          description={
            searchQuery
              ? 'Try modifying your search keywords or clear filters.'
              : 'Add technical documentation, GitHub repos, and useful articles to keep handy.'
          }
          actionLabel="Add Bookmark"
          onAction={() => {
            setEditingBookmark(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookmarks.map((bookmark) => {
            const domain = getDomainFromUrl(bookmark.url);
            const isCopied = copiedId === bookmark.id;

            return (
              <div
                key={bookmark.id}
                className="group relative flex flex-col justify-between p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getCategoryBadgeClass(
                        bookmark.category
                      )}`}
                    >
                      {bookmark.category}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyUrl(bookmark.url, bookmark.id)}
                        title="Copy URL"
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingBookmark(bookmark);
                          setIsModalOpen(true);
                        }}
                        title="Edit bookmark"
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingBookmark(bookmark)}
                        title="Delete bookmark"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus:outline-none focus:underline"
                    >
                      {bookmark.title}
                    </a>
                  </h3>

                  {bookmark.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {bookmark.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-750/50 flex flex-col gap-2">
                  {bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {bookmark.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60"
                        >
                          <Tag className="w-2.5 h-2.5 opacity-60" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="font-mono text-[11px] truncate max-w-[180px]" title={domain}>
                      {domain}
                    </span>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-[11px]"
                    >
                      Visit
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bookmark Create/Edit Modal */}
      <BookmarkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBookmark(null);
        }}
        bookmarkToEdit={editingBookmark}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingBookmark}
        onClose={() => setDeletingBookmark(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Bookmark"
        message={`Are you sure you want to delete "${deletingBookmark?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
      />
    </div>
  );
};
