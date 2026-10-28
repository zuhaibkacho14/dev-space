import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Plus,
  Search,
  FileText,
  Star,
  Trash2,
  Check,
  Eye,
  Edit3,
  Clock,
  Tag,
  X,
} from 'lucide-react';
import { Note } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

export const NotesView: React.FC = () => {
  const { data, addNote, updateNote, deleteNote, toggleNoteFavorite } = useWorkspace();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  // Local draft state for active note to support immediate responsive typing
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filtered notes list
  const filteredNotes = useMemo(() => {
    return data.notes
      .filter((n) => {
        if (onlyFavorites && !n.isFavorite) return false;
        if (selectedTag && !n.tags.includes(selectedTag)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = n.title.toLowerCase().includes(q);
          const matchContent = n.content.toLowerCase().includes(q);
          const matchTag = n.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data.notes, onlyFavorites, selectedTag, searchQuery]);

  // Set default selected note if none selected or if selected note was deleted
  useEffect(() => {
    if (!selectedNoteId && filteredNotes.length > 0) {
      setSelectedNoteId(filteredNotes[0].id);
    } else if (selectedNoteId && !data.notes.some((n) => n.id === selectedNoteId)) {
      setSelectedNoteId(filteredNotes[0]?.id || null);
    }
  }, [filteredNotes, selectedNoteId, data.notes]);

  // Sync draft when selectedNoteId changes
  useEffect(() => {
    if (!selectedNoteId) {
      setDraftTitle('');
      setDraftContent('');
      setDraftTags([]);
      return;
    }

    const note = data.notes.find((n) => n.id === selectedNoteId);
    if (note) {
      setDraftTitle(note.title);
      setDraftContent(note.content);
      setDraftTags(note.tags || []);
      setSaveStatus('saved');
      setLastSavedTime(new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [selectedNoteId]);

  // Debounced Autosave Trigger
  const triggerAutosave = (newTitle: string, newContent: string, newTags: string[]) => {
    if (!selectedNoteId) return;

    setSaveStatus('saving');
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      updateNote(selectedNoteId, {
        title: newTitle.trim() || 'Untitled Note',
        content: newContent,
        tags: newTags,
      });
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
  };

  const handleTitleChange = (val: string) => {
    setDraftTitle(val);
    triggerAutosave(val, draftContent, draftTags);
  };

  const handleContentChange = (val: string) => {
    setDraftContent(val);
    triggerAutosave(draftTitle, val, draftTags);
  };

  const handleAddTag = () => {
    const cleaned = tagInput.trim().replace(/^#/, '');
    if (cleaned && !draftTags.includes(cleaned)) {
      const nextTags = [...draftTags, cleaned];
      setDraftTags(nextTags);
      setTagInput('');
      triggerAutosave(draftTitle, draftContent, nextTags);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const nextTags = draftTags.filter((t) => t !== tag);
    setDraftTags(nextTags);
    triggerAutosave(draftTitle, draftContent, nextTags);
  };

  const handleCreateNewNote = () => {
    const created = addNote({
      title: 'New Architecture Note',
      content: '# Document Title\n\nWrite your technical notes here...',
      tags: [],
      isFavorite: false,
    });
    setSelectedNoteId(created.id);
  };

  // Safe markdown preview renderer (escapes raw HTML, formats headings, lists, bold, and code blocks)
  const renderSafeMarkdown = (rawText: string) => {
    // Split into lines
    const lines = rawText.split('\n');

    return (
      <div className="space-y-2 text-xs leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-lg font-bold text-slate-100 mt-3 pb-1 border-b border-slate-800">
                {line.slice(2)}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-sm font-bold text-slate-100 mt-2.5">
                {line.slice(3)}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs font-bold text-indigo-400 mt-2">
                {line.slice(4)}
              </h3>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{line.slice(2)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            const match = line.match(/^(\d+\.)\s(.*)/);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-slate-400 font-mono text-[11px]">{match ? match[1] : '1.'}</span>
                <span>{match ? match[2] : line}</span>
              </div>
            );
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-2" />;
          }
          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  // Extract all unique tags across notes for filtering
  const allUniqueTags = useMemo(() => {
    const set = new Set<string>();
    data.notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [data.notes]);

  const wordCount = useMemo(() => {
    return draftContent.trim() ? draftContent.trim().split(/\s+/).length : 0;
  }, [draftContent]);

  return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] flex flex-col md:flex-row rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
      {/* Left Sidebar: Notes Browser (w-full on mobile, w-80 on desktop) */}
      <div className={`w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-900/90 ${selectedNoteId ? 'hidden md:flex' : 'flex'}`}>
        {/* Search & Actions Header */}
        <div className="p-3.5 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Developer Notes ({data.notes.length})
            </span>
            <button
              onClick={handleCreateNewNote}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes & content..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          {/* Tags / Favorites Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-2 py-0.5 rounded-md font-medium border flex items-center gap-1 shrink-0 ${
                onlyFavorites
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Star className={`w-3 h-3 ${onlyFavorites ? 'fill-amber-400' : ''}`} />
              Favorites
            </button>

            {allUniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-md font-mono shrink-0 transition ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching notes found.
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = selectedNoteId === note.id;

              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`p-3 rounded-xl cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border border-indigo-500/30 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold truncate flex-1">{note.title}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNoteFavorite(note.id);
                      }}
                      className={`p-0.5 text-slate-500 hover:text-amber-400 ${
                        note.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                      }`}
                    >
                      <Star className={`w-3 h-3 ${note.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {note.content.replace(/[#*`-]/g, '')}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                    <span>
                      {new Date(note.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {note.tags.length > 0 && <span>#{note.tags[0]}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Note Editor & Safe Preview */}
      <div className={`flex-1 flex flex-col bg-slate-950 ${!selectedNoteId ? 'hidden md:flex' : 'flex'}`}>
        {!selectedNoteId ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              icon={FileText}
              title="Select a note or create one"
              description="Choose a technical note from the left sidebar or draft a new decision record."
              actionLabel="Create Note"
              onAction={handleCreateNewNote}
            />
          </div>
        ) : (
          <>
            {/* Note Editor Header Bar */}
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedNoteId(null)}
                  className="md:hidden text-xs text-indigo-400 flex items-center gap-1 font-medium"
                >
                  &larr; Back
                </button>

                {/* Autosave Indicator */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  {saveStatus === 'saving' ? (
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Clock className="w-3 h-3 animate-spin" /> Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Check className="w-3 h-3 text-emerald-400" /> Saved {lastSavedTime}
                    </span>
                  )}
                </div>
              </div>

              {/* View & Delete Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    isPreview
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {isPreview ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{isPreview ? 'Editor' : 'Preview'}</span>
                </button>

                <button
                  onClick={() => {
                    const currentNote = data.notes.find((n) => n.id === selectedNoteId);
                    if (currentNote) setNoteToDelete(currentNote);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Note Meta (Tags, Word Count) */}
            <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Tags Input */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <Tag className="w-3 h-3 text-slate-500" />
                {draftTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    #{t}
                    <button onClick={() => handleRemoveTag(t)} className="hover:text-rose-400">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
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
                  placeholder="+ Add tag (Enter)"
                  className="bg-transparent text-[11px] text-slate-300 focus:outline-none w-24"
                />
              </div>

              {/* Stats */}
              <span className="text-[10px] font-mono text-slate-500">
                {wordCount} words • {draftContent.length} chars
              </span>
            </div>

            {/* Editor vs Safe Preview Canvas */}
            <div className="flex-1 p-6 overflow-y-auto">
              {isPreview ? (
                <div className="max-w-3xl mx-auto space-y-4">
                  <h1 className="text-xl font-bold text-slate-100 pb-2 border-b border-slate-800">
                    {draftTitle || 'Untitled Note'}
                  </h1>
                  {renderSafeMarkdown(draftContent)}
                </div>
              ) : (
                <div className="max-w-3xl mx-auto h-full flex flex-col space-y-4">
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Note Title..."
                    className="w-full bg-transparent text-xl font-bold text-slate-100 focus:outline-none placeholder:text-slate-600 border-none p-0"
                  />
                  <textarea
                    value={draftContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Write in markdown or plain text (# Heading, - List item)..."
                    className="w-full flex-1 bg-transparent text-xs text-slate-200 focus:outline-none placeholder:text-slate-600 resize-none leading-relaxed font-sans border-none p-0"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Note Confirmation */}
      {noteToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setNoteToDelete(null)}
          onConfirm={() => {
            deleteNote(noteToDelete.id);
            if (selectedNoteId === noteToDelete.id) {
              setSelectedNoteId(null);
            }
          }}
          title={`Delete Note "${noteToDelete.title}"?`}
          message="Are you sure you want to delete this developer note? This action cannot be undone."
          confirmLabel="Delete Note"
          isDestructive={true}
        />
      )}
    </div>
  );
};
