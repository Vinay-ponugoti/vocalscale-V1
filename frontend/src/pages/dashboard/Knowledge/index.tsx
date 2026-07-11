import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, FileText, Trash2, Loader2, CheckCircle2, AlertCircle, Clock, Search, Sparkles } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { businessSetupAPI } from '../../../api/businessSetup';
import { agentsAPI, type Agent } from '../../../api/agents';

// Sentinel for "business-wide" (no agent scope) in the selector.
const ALL_AGENTS = '';

type KnowledgeFile = Awaited<ReturnType<typeof businessSetupAPI.getKnowledgeFiles>>[number];

const ACCEPT = '.pdf,.txt,.docx,.md,.csv,.xlsx,.png,.jpg,.jpeg,.webp';

const EXAMPLE_TILES = [
  { emoji: '📋', label: 'Menu / price list', hint: 'What you offer & what it costs' },
  { emoji: '❓', label: 'FAQs', hint: 'Common customer questions' },
  { emoji: '📅', label: 'Hours & policies', hint: 'Opening times, refunds, rules' },
  { emoji: '📍', label: 'Locations', hint: 'Address, parking, directions' },
] as const;

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
};

const formatRelativeDate = (iso?: string) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secondsAgo = Math.round((Date.now() - then) / 1000);
  if (secondsAgo < 60) return 'just now';
  const minutes = Math.round(secondsAgo / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const StatusBadge = ({ status }: { status: KnowledgeFile['status'] }) => {
  const map = {
    COMPLETED: { icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50', label: 'Ready' },
    PROCESSING: { icon: Loader2, cls: 'text-blue-600 bg-blue-50', label: 'Processing' },
    PENDING: { icon: Clock, cls: 'text-slate-500 bg-slate-100', label: 'Pending' },
    FAILED: { icon: AlertCircle, cls: 'text-red-600 bg-red-50', label: 'Failed' },
  } as const;
  const { icon: Icon, cls, label } = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
      <Icon size={13} className={status === 'PROCESSING' ? 'animate-spin' : ''} />
      {label}
    </span>
  );
};

const Knowledge = () => {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<{ name: string; index: number; total: number; fraction: number } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<KnowledgeFile | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Awaited<ReturnType<typeof businessSetupAPI.searchKnowledge>> | null>(null);
  const [searchError, setSearchError] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  // '' = business-wide (all). Otherwise a specific agent id.
  const [selectedAgent, setSelectedAgent] = useState<string>(ALL_AGENTS);
  const inputRef = useRef<HTMLInputElement>(null);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scope = selectedAgent || null;

  const refresh = useCallback(async () => {
    try {
      setFiles(await businessSetupAPI.getKnowledgeFiles(scope));
      setError('');
    } catch (err) {
      setFiles([]);
      if (err instanceof TypeError) {
        // Network-level failure — log the technical detail for developers,
        // show the user something they can act on.
        console.error('Knowledge service unreachable — check the knowledge processor / VITE_KNOWLEDGE_API_URL', err);
        setError('The knowledge service is temporarily unreachable. Your documents are safe — try again in a moment.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load knowledge files');
      }
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Load the business's agents once so the user can scope knowledge per agent.
  useEffect(() => {
    agentsAPI
      .listAgents()
      .then(setAgents)
      .catch(() => setAgents([]));
  }, []);

  // Clear stale search results when the scope changes.
  useEffect(() => {
    setResults(null);
    setSearchError('');
  }, [scope]);

  // Poll while anything is still processing so status flips to Ready automatically.
  useEffect(() => {
    if (!files.some((f) => f.status === 'PROCESSING' || f.status === 'PENDING')) return;
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [files, refresh]);

  const uploadFiles = async (fileList: FileList | File[] | null) => {
    const list = Array.from(fileList ?? []);
    if (list.length === 0) return;
    setUploading(true);
    setError('');
    const failures: string[] = [];
    // Upload sequentially so the processor isn't hit with a burst and so
    // one bad file doesn't abort the rest.
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      setProgress({ name: file.name, index: i + 1, total: list.length, fraction: 0 });
      try {
        await businessSetupAPI.uploadKnowledgeDocument(
          file,
          (fraction) => setProgress({ name: file.name, index: i + 1, total: list.length, fraction }),
          scope,
        );
      } catch (err) {
        failures.push(`${file.name}: ${err instanceof Error ? err.message : 'upload failed'}`);
      }
    }
    setProgress(null);
    await refresh();
    if (failures.length) setError(failures.join('  •  '));
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    uploadFiles(e.dataTransfer.files);
  };

  // Hide-then-commit delete so the user gets an Undo window. Filtering by
  // hiddenId (rather than dropping from state) keeps it robust against the
  // 3s polling refresh, which would otherwise resurrect the row.
  const commitDelete = useCallback(
    async (id: string) => {
      try {
        await businessSetupAPI.deleteKnowledgeFile(id);
      } finally {
        refresh();
      }
    },
    [refresh],
  );

  const handleDelete = (file: KnowledgeFile) => {
    // If a previous delete is still pending, commit it now before starting a new one.
    if (deleteTimer.current) {
      clearTimeout(deleteTimer.current);
      if (pendingDelete && pendingDelete.id !== file.id) commitDelete(pendingDelete.id);
    }
    setPendingDelete(file);
    deleteTimer.current = setTimeout(() => {
      deleteTimer.current = null;
      setPendingDelete(null);
      commitDelete(file.id);
    }, 5000);
  };

  const undoDelete = () => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    deleteTimer.current = null;
    setPendingDelete(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || searching) return;
    setSearching(true);
    setSearchError('');
    try {
      setResults(await businessSetupAPI.searchKnowledge(q, 5, scope));
    } catch (err) {
      setResults(null);
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Commit any pending delete if the component unmounts.
  useEffect(() => () => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
  }, []);

  const visibleFiles = pendingDelete ? files.filter((f) => f.id !== pendingDelete.id) : files;
  const hasReady = visibleFiles.some((f) => f.status === 'COMPLETED');
  const selectedAgentName = agents.find((a) => a.id === selectedAgent)?.name;
  const agentNameById = new Map(agents.map((a) => [a.id, a.name]));

  return (
    <DashboardLayout fullWidth>
      <div className="scrollbar-hide h-full overflow-y-auto bg-[hsl(var(--ds-off-white))] text-slate-950">
        <div className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-6 md:px-6 md:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Knowledge base</h1>
              <p className="mt-1 text-sm text-slate-500">
                Upload documents or images. Your AI reads them to answer customer calls accurately.
              </p>
            </div>
            {agents.length > 0 && (
              <label className="flex shrink-0 flex-col gap-1 text-xs font-medium text-slate-500 sm:items-end">
                Knowledge for
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value={ALL_AGENTS}>All agents (business-wide)</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                      {a.is_default ? ' (default)' : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!uploading) setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
              dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              onChange={handleInputChange}
              className="hidden"
              id="kb-upload"
            />
            <label
              htmlFor="kb-upload"
              className="mx-auto flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Uploading…' : 'Upload documents or images'}
            </label>
            <p className="mt-3 text-xs text-slate-400">
              {dragging ? 'Drop your files to upload' : 'Drag & drop files here, or click to browse'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              PDF, Word, text, CSV, Excel, or images (PNG/JPG) — you can select multiple
            </p>
            <p className="mt-1 text-xs font-medium text-blue-600">
              {selectedAgentName
                ? `Files added here go to “${selectedAgentName}” only`
                : 'Files added here are shared with all agents'}
            </p>
            {progress && (
              <div className="mx-auto mt-4 w-full max-w-sm">
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate pr-2">
                    {progress.total > 1 ? `(${progress.index}/${progress.total}) ` : ''}
                    {progress.name}
                  </span>
                  <span className="shrink-0 tabular-nums">{Math.round(progress.fraction * 100)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-150"
                    style={{ width: `${Math.round(progress.fraction * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>

          {hasReady && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-800">Test what your AI knows</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Ask a question the way a customer would. You’ll see the exact answer your AI would give.
              </p>
              <form onSubmit={handleSearch} className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Do you deliver on Sundays?"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !query.trim()}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                  Ask
                </button>
              </form>

              {searchError && <p className="mt-3 text-sm text-red-600">{searchError}</p>}

              {results && !searchError && (
                results.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    Your AI didn’t find anything for that. Consider uploading a document that covers it.
                  </p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {results.map((r) => (
                      <div key={r.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-slate-700">{r.content}</p>
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {Math.round((r.score ?? 0) * 100)}% match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white">
            {loading ? (
              <div className="flex items-center justify-center p-10 text-slate-400">
                <Loader2 className="animate-spin" />
              </div>
            ) : visibleFiles.length === 0 ? (
              <div className="p-8 text-center md:p-10">
                <p className="text-sm font-medium text-slate-600">No documents yet</p>
                <p className="mt-1 text-sm text-slate-400">
                  Add anything your AI should know to answer customer calls. For example:
                </p>
                <div className="mx-auto mt-5 grid max-w-lg grid-cols-2 gap-3">
                  {EXAMPLE_TILES.map((tile) => (
                    <button
                      key={tile.label}
                      onClick={() => inputRef.current?.click()}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      <span className="text-xl leading-none">{tile.emoji}</span>
                      <span>
                        <span className="block text-sm font-medium text-slate-700">{tile.label}</span>
                        <span className="block text-xs text-slate-400">{tile.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {visibleFiles.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText size={18} className="shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{f.filename}</p>
                        <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                          {[formatBytes(f.size_bytes), formatRelativeDate(f.upload_timestamp)]
                            .filter(Boolean)
                            .join(' · ')}
                          {f.doc_type && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium capitalize text-slate-500">
                              {f.doc_type.replace('_', ' ')}
                            </span>
                          )}
                          {selectedAgent === ALL_AGENTS && f.agent_id && (
                            <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-600">
                              {agentNameById.get(f.agent_id) ?? 'Agent-specific'}
                            </span>
                          )}
                          {f.status === 'COMPLETED' && (
                            <span className="font-medium text-emerald-600">
                              {(f.fact_count ?? 0) > 0
                                ? `${f.fact_count} answers your AI learned`
                                : `${f.chunk_count ?? 0} sections indexed`}
                            </span>
                          )}
                        </p>
                        {f.status === 'FAILED' && (
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-red-600">
                            <span>{f.error || 'We couldn’t read this file. Try re-uploading it.'}</span>
                            <button
                              onClick={() => inputRef.current?.click()}
                              className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
                            >
                              <Upload size={12} /> Re-upload
                            </button>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <StatusBadge status={f.status} />
                      <button
                        onClick={() => handleDelete(f)}
                        className="text-slate-400 transition hover:text-red-600"
                        aria-label="Delete document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {pendingDelete && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="flex items-center gap-4 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
            <span className="truncate">
              Deleted <span className="font-medium">{pendingDelete.filename}</span>
            </span>
            <button
              onClick={undoDelete}
              className="shrink-0 font-semibold text-blue-300 transition hover:text-blue-200"
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Knowledge;
