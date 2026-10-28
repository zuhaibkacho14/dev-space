import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Snippet, SnippetLanguage } from '../../types';
import { X } from 'lucide-react';

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialSnippet?: Snippet | null;
}

const SUPPORTED_LANGUAGES: { value: SnippetLanguage; label: string }[] = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'plaintext', label: 'Plain Text' },
];

export const SnippetModal: React.FC<SnippetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSnippet,
}) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<SnippetLanguage>('typescript');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; code?: string }>({});

  useEffect(() => {
    if (initialSnippet) {
      setTitle(initialSnippet.title);
      setLanguage(initialSnippet.language);
      setDescription(initialSnippet.description);
      setCode(initialSnippet.code);
      setTags(initialSnippet.tags || []);
      setIsFavorite(initialSnippet.isFavorite);
    } else {
      setTitle('');
      setLanguage('typescript');
      setDescription('');
      setCode('');
      setTags([]);
      setIsFavorite(false);
    }
    setTagInput('');
    setErrors({});
  }, [initialSnippet, isOpen]);

  const handleAddTag = () => {
    const cleaned = tagInput.trim().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; code?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Snippet title is required.';
    }
    if (!code.trim()) {
      newErrors.code = 'Code content cannot be empty.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      title: title.trim(),
      language,
      description: description.trim(),
      code,
      tags,
      isFavorite,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSnippet ? 'Edit Snippet' : 'Save Code Snippet'}
      description="Store reusable helper algorithms, configurations, and queries."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Language Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., PostgreSQL Running Total Query"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition"
              autoFocus
            />
            {errors.title && <p className="text-[11px] text-rose-400 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SnippetLanguage)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief explanation of what this snippet solves..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Code Content */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Code Content <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={9}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`// Paste your ${language} code here...`}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-indigo-500 focus:outline-none transition resize-y leading-relaxed"
            spellCheck={false}
          />
          {errors.code && <p className="text-[11px] text-rose-400 mt-1">{errors.code}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tags</label>
          <div className="flex gap-2 mb-2">
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
              placeholder="e.g., Database, Concurrency (Press Enter)"
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
            >
              Add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
            className="rounded border-slate-700 text-indigo-600 focus:ring-0"
          />
          <span>Mark as Favorite Snippet ⭐</span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-900/30 transition hover:-translate-y-0.5 active:translate-y-0"
          >
            {initialSnippet ? 'Save Changes' : 'Save Snippet'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
