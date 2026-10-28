import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Plus,
  Search,
  Code2,
  Copy,
  Check,
  Star,
  Edit2,
  Trash2,
  Tag,
} from 'lucide-react';
import { Snippet, SnippetLanguage } from '../../types';
import { tokenizeCode, getTokenClassName } from '../../services/syntaxHighlighter';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

interface SnippetsViewProps {
  onOpenCreateModal: () => void;
  onEditSnippet: (snippet: Snippet) => void;
}

export const SnippetsView: React.FC<SnippetsViewProps> = ({
  onOpenCreateModal,
  onEditSnippet,
}) => {
  const { data, deleteSnippet, toggleSnippetFavorite, showToast } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | SnippetLanguage>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null);

  // Filtered snippets
  const filteredSnippets = useMemo(() => {
    return data.snippets.filter((s) => {
      if (onlyFavorites && !s.isFavorite) return false;
      if (languageFilter !== 'all' && s.language !== languageFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesDesc = s.description.toLowerCase().includes(q);
        const matchesCode = s.code.toLowerCase().includes(q);
        const matchesTag = s.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCode && !matchesTag) return false;
      }

      return true;
    });
  }, [data.snippets, onlyFavorites, languageFilter, searchQuery]);

  // Copy code handler
  const handleCopyCode = async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedId(snippet.id);
      showToast('Copied to Clipboard!', `Snippet "${snippet.title}" copied.`, 'success', 2000);
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      showToast('Copy Failed', 'Please copy manually from the editor.', 'error');
    }
  };

  const getLanguageBadge = (lang: SnippetLanguage) => {
    const colors: Record<SnippetLanguage, string> = {
      typescript: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      javascript: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      python: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      sql: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      bash: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      html: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      css: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      json: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      markdown: 'text-slate-300 bg-slate-700/40 border-slate-600/40',
      plaintext: 'text-slate-400 bg-slate-800 border-slate-700',
    };

    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
          colors[lang] || colors.plaintext
        }`}
      >
        {lang}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code snippets, functions, or tags..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:border-indigo-500 focus:outline-none transition shrink-0"
          >
            <option value="all">All Languages</option>
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="plaintext">Plain Text</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
              onlyFavorites
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400' : ''}`} />
            <span>Favorites</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-900/30 transition hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Snippet</span>
          </button>
        </div>
      </div>

      {/* Snippet Grid */}
      {filteredSnippets.length === 0 ? (
        <EmptyState
          icon={Code2}
          title={searchQuery || onlyFavorites ? 'No matching snippets found' : 'No snippets saved'}
          description={
            searchQuery || onlyFavorites
              ? 'Try adjusting your search terms or filters.'
              : 'Save reusable code snippets, SQL queries, regexes, and shell commands with syntax highlighting.'
          }
          actionLabel={searchQuery || onlyFavorites ? undefined : 'Add First Snippet'}
          onAction={searchQuery || onlyFavorites ? undefined : onOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSnippets.map((snippet) => {
            const tokenLines = tokenizeCode(snippet.code, snippet.language);
            const isCopied = copiedId === snippet.id;

            return (
              <div
                key={snippet.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getLanguageBadge(snippet.language)}
                        <button
                          onClick={() => toggleSnippetFavorite(snippet.id)}
                          className={`text-slate-500 hover:text-amber-400 p-0.5 transition ${
                            snippet.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                          title="Toggle favorite"
                          aria-label="Toggle favorite"
                        >
                          <Star className={`w-3.5 h-3.5 ${snippet.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-100 truncate">
                        {snippet.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopyCode(snippet)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title="Copy to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onEditSnippet(snippet)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                        title="Edit snippet"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSnippetToDelete(snippet)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete snippet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {snippet.description && (
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {snippet.description}
                    </p>
                  )}

                  {/* Tokenized Syntax Highlighting Display */}
                  <div className="rounded-xl bg-slate-950 border border-slate-800/90 p-3 overflow-x-auto max-h-56 font-mono text-[11px] leading-relaxed select-text">
                    <pre className="table w-full">
                      {tokenLines.map((lineTokens, lineIdx) => (
                        <div key={lineIdx} className="table-row hover:bg-slate-900/60 transition">
                          <span className="table-cell pr-3 text-right text-slate-600 select-none text-[10px] w-8">
                            {lineIdx + 1}
                          </span>
                          <span className="table-cell">
                            {lineTokens.map((token, tokenIdx) => (
                              <span key={tokenIdx} className={getTokenClassName(token.type)}>
                                {token.content}
                              </span>
                            ))}
                          </span>
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>

                {/* Footer Tags & Date */}
                {snippet.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
                    <Tag className="w-3 h-3 text-slate-500 shrink-0" />
                    {snippet.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {snippetToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setSnippetToDelete(null)}
          onConfirm={() => deleteSnippet(snippetToDelete.id)}
          title={`Delete Snippet "${snippetToDelete.title}"?`}
          message="Are you sure you want to delete this snippet? The code will be permanently removed."
          confirmLabel="Delete Snippet"
          isDestructive={true}
        />
      )}
    </div>
  );
};
