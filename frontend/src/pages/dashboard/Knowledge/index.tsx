import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, FileText, Trash2, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { businessSetupAPI } from '../../../api/businessSetup';

type KnowledgeFile = Awaited<ReturnType<typeof businessSetupAPI.getKnowledgeFiles>>[number];

const ACCEPT = '.pdf,.txt,.docx,.md,.csv,.xlsx,.png,.jpg,.jpeg,.webp';

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
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setFiles(await businessSetupAPI.getKnowledgeFiles());
      setError('');
    } catch (err) {
      setFiles([]);
      setError(
        err instanceof TypeError
          ? 'Knowledge service is unavailable. Start the knowledge processor on port 8001 or update VITE_KNOWLEDGE_API_URL.'
          : err instanceof Error
            ? err.message
            : 'Failed to load knowledge files'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll while anything is still processing so status flips to Ready automatically.
  useEffect(() => {
    if (!files.some((f) => f.status === 'PROCESSING' || f.status === 'PENDING')) return;
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [files, refresh]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await businessSetupAPI.uploadKnowledgeDocument(file);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    try {
      await businessSetupAPI.deleteKnowledgeFile(id);
    } catch {
      refresh();
    }
  };

  return (
    <DashboardLayout fullWidth>
      <div className="scrollbar-hide h-full overflow-y-auto bg-[#f7f8fb] text-slate-950">
        <div className="mx-auto w-full max-w-[1100px] space-y-6 px-4 py-6 md:px-6 md:py-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Knowledge base</h1>
            <p className="mt-1 text-sm text-slate-500">
              Upload documents or images. Your AI reads them to answer customer calls accurately.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleUpload}
              className="hidden"
              id="kb-upload"
            />
            <label
              htmlFor="kb-upload"
              className="mx-auto flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? 'Uploading…' : 'Upload document or image'}
            </label>
            <p className="mt-3 text-xs text-slate-400">PDF, Word, text, CSV, Excel, or images (PNG/JPG)</p>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white">
            {loading ? (
              <div className="flex items-center justify-center p-10 text-slate-400">
                <Loader2 className="animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">
                No documents yet. Upload your menu, price list, FAQs, or policies to get started.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText size={18} className="shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{f.filename}</p>
                        <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                          {f.upload_timestamp ? new Date(f.upload_timestamp).toLocaleString() : ''}
                          {f.doc_type && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium capitalize text-slate-500">
                              {f.doc_type.replace('_', ' ')}
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
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <StatusBadge status={f.status} />
                      <button
                        onClick={() => handleDelete(f.id)}
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
    </DashboardLayout>
  );
};

export default Knowledge;
