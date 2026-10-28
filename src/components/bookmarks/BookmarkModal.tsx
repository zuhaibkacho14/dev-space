import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCategory } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Modal } from '../common/Modal';
import { validateHttpUrl } from '../../services/urlValidator';
import { Bookmark as BookmarkIcon, Link2, Tag, AlertCircle } from 'lucide-react';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkToEdit?: Bookmark | null;
}

const CATEGORIES: BookmarkCategory[] = [
  'Documentation',
  'GitHub',
  'Articles',
  'Tools',
  'Inspiration',
  'Other',
];

export const BookmarkModal: React.FC<BookmarkModalProps> = ({
  isOpen,
  onClose,
  bookmarkToEdit,
}) => {
  const { addBookmark, updateBookmark, showToast } = useWorkspace();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<BookmarkCategory>('Documentation');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bookmarkToEdit) {
      setTitle(bookmarkToEdit.title);
      setUrl(bookmarkToEdit.url);
      setCategory(bookmarkToEdit.category);
      setDescription(bookmarkToEdit.description || '');
      setTags(bookmarkToEdit.tags || []);
      setTagInput('');
      setUrlError(null);
    } else {
      setTitle('');
      setUrl('');
      setCategory('Documentation');
      setDescription('');
      setTags([]);
      setTagInput('');
      setUrlError(null);
    }
  }, [bookmarkToEdit, isOpen]);

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().toLowerCase().replace(/^[#]/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleUrlBlur = () => {
    if (!url.trim()) return;
    const result = validateHttpUrl(url);
    if (!result.isValid) {
      setUrlError(result.error || 'Invalid URL');
    } else {
      setUrlError(null);
      setUrl(result.normalizedUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Validation Error', 'Title is required', 'error');
      return;
    }

    const valResult = validateHttpUrl(url);
    if (!valResult.isValid) {
      setUrlError(valResult.error || 'Invalid URL');
      showToast('Validation Error', valResult.error || 'Please enter a valid HTTP/HTTPS URL', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (bookmarkToEdit) {
        updateBookmark(bookmarkToEdit.id, {
          title: title.trim(),
          url: valResult.normalizedUrl,
          category,
          description: description.trim(),
          tags,
        });
        showToast('Bookmark updated', `"${title.trim()}" was updated`, 'success');
      } else {
        addBookmark({
          title: title.trim(),
          url: valResult.normalizedUrl,
          category,
          description: description.trim(),
          tags,
        });
        showToast('Bookmark added', `"${title.trim()}" added to library`, 'success');
      }
      onClose();
    } catch {
      showToast('Error', 'Failed to save bookmark', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bookmarkToEdit ? 'Edit Bookmark' : 'Add New Bookmark'}
      description="Save frequently visited documentation, toolkits, or repositories."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Tailwind CSS Documentation"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            URL (http/https only) *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) setUrlError(null);
              }}
              onBlur={handleUrlBlur}
              placeholder="https://tailwindcss.com/docs"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                urlError
                  ? 'border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
              } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors`}
            />
          </div>
          {urlError && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {urlError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as BookmarkCategory)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Helpful reference notes or shortcuts..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press Enter"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500 focus:outline-none"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
          >
            <BookmarkIcon className="w-4 h-4" />
            {bookmarkToEdit ? 'Save Changes' : 'Add Bookmark'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
