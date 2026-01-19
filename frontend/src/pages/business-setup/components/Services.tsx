import React, { useState } from 'react';
import {
  Upload, Plus, Trash2, Edit2,
  FileText, Check, ChevronDown, Loader2,
  FileUp, Brain, File as FileIcon, AlertCircle
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { useToast } from '../../../hooks/useToast';
import { businessSetupAPI } from '../../../api/businessSetup';
import type { Service as GlobalService } from '../../../types/business';

// --- Styled Components to match previous pages ---

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block transition-all ${props.className || ''}`}
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block resize-none transition-all ${props.className || ''}`}
  />
);

// --- Types & Logic ---

interface Service extends Omit<GlobalService, 'price'> {
  id: string;
  priceType: 'flat' | 'hourly' | 'starting';
  amount: number;
  duration?: string;
  isExpanded?: boolean;
}

export const Services: React.FC = () => {
  const { state, actions } = useBusinessSetup();
  const { showToast } = useToast();
  const [localServices, setLocalServices] = useState<Service[]>([]);
  // File Registry State
  interface KnowledgeFile {
    id: string;
    filename: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    upload_timestamp: string;
    chunks_count?: number;
    error?: string;
  }
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Interaction States
  type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [progressMessage, setProgressMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const lastSyncedRef = React.useRef<string>('');

  // Sync with Global State (Incoming)
  React.useEffect(() => {
    const incomingServices = state.data.services || [];
    const incomingString = JSON.stringify(incomingServices);

    // Only update local if global data changed and it's not from our own last sync
    if (incomingString !== lastSyncedRef.current && !state.loading) {
      const newLocal = incomingServices.map((s: GlobalService, idx: number) => {
        const existing = localServices.find(p => p.id === s.id);
        return {
          id: s.id || `service-${idx}-${Date.now()}`,
          name: s.name || '',
          amount: s.price || 0,
          priceType: (existing?.priceType as 'flat' | 'hourly' | 'starting') || 'flat',
          duration: existing?.duration,
          description: s.description || '',
          isExpanded: existing?.isExpanded || false
        };
      });
      setLocalServices(newLocal);
      lastSyncedRef.current = incomingString;
    }
  }, [state.data.services, state.loading, localServices]);

  // Fetch Knowledge Files
  const fetchKnowledgeFiles = React.useCallback(async () => {
    try {
      const files = await businessSetupAPI.getKnowledgeFiles();
      setKnowledgeFiles(files);
    } catch (err) {
      console.error('Failed to fetch knowledge files', err);
    }
  }, []);

  React.useEffect(() => {
    fetchKnowledgeFiles();
    // Poll every 10 seconds to keep updated
    const interval = setInterval(fetchKnowledgeFiles, 10000);
    return () => clearInterval(interval);
  }, [fetchKnowledgeFiles]);

  // Sync Back to Global State (Outgoing)

  // Sync Back to Global State (Outgoing)
  const syncToGlobal = React.useCallback((services: Service[]) => {
    const globalServices: GlobalService[] = services.map(s => ({
      id: s.id.startsWith('service-') ? undefined : s.id,
      name: s.name,
      price: s.amount,
      description: s.description
    }));

    const globalString = JSON.stringify(globalServices);
    if (globalString !== lastSyncedRef.current) {
      lastSyncedRef.current = globalString;
      actions.updateServices(globalServices);
    }
  }, [actions]);

  // Debounce sync for typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      syncToGlobal(localServices);
    }, 800); // Wait for 800ms of inactivity
    return () => clearTimeout(timer);
  }, [localServices, syncToGlobal]);

  const toggleExpand = (id: string) => {
    setLocalServices(prev => {
      const updated = prev.map(s =>
        s.id === id ? { ...s, isExpanded: !s.isExpanded } : s
      );
      // Immediate sync on collapse to ensure data is captured
      const target = updated.find(s => s.id === id);
      if (target && !target.isExpanded) {
        syncToGlobal(updated);
      }
      return updated;
    });
  };

  const updateService = <K extends keyof Service>(id: string, field: K, value: Service[K]) => {
    setLocalServices(prev => prev.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
    // syncToGlobal is handled by the debounced useEffect
  };

  const removeService = (id: string) => {
    const updated = localServices.filter(s => s.id !== id);
    setLocalServices(updated);
    syncToGlobal(updated);
  };

  // Persistent State Keys
  const STORAGE_KEY_TASK_ID = 'vocalscale_knowledge_task_id';
  const STORAGE_KEY_FILE_NAME = 'vocalscale_knowledge_file_name';

  // Poll for Status (Reusable)
  const pollTaskStatus = React.useCallback(async (taskId: string, fileName: string) => {

    // Set active state
    setProcessingStatus('processing');
    setProgressMessage('Processing document content...');

    const pollInterval = 2000;
    const maxAttempts = 60;
    let attempts = 0;

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setProcessingStatus('error');
        setErrorMessage('Processing timeout. System is busy.');
        showToast('Processing timeout.', 'warning');
        cleanupStorage();
        return;
      }

      try {
        const statusRes = await businessSetupAPI.getTaskStatus(taskId);
        console.log('Poll status:', statusRes.status);

        if (statusRes.status === 'SUCCESS') {
          setProcessingStatus('success');
          const chunks = statusRes.result?.chunks_count || 0;
          setProgressMessage(`Done! Added ${chunks} chunks.`);
          showToast(`Successfully processed ${fileName}!`, 'success');
          showToast(`Successfully processed ${fileName}!`, 'success');
          cleanupStorage();
          fetchKnowledgeFiles(); // Refresh list

          // Reset after delay

          // Reset after delay
          setTimeout(() => {
            setProcessingStatus('idle');
            setProgressMessage('');
          }, 3000);

        } else if (statusRes.status === 'FAILURE') {
          setProcessingStatus('error');
          setErrorMessage('Processing failed on server.');
          showToast('Processing failed.', 'error');
          cleanupStorage();
        } else {
          // Still pending/started, retrying...
          attempts++;
          setTimeout(checkStatus, pollInterval);
        }
      } catch (err) {
        console.error('Polling error', err);
        attempts++;
        setTimeout(checkStatus, pollInterval);
      }
    };

    // Start the loop
    checkStatus();
  }, []);

  const cleanupStorage = () => {
    localStorage.removeItem(STORAGE_KEY_TASK_ID);
    localStorage.removeItem(STORAGE_KEY_FILE_NAME);
  };

  // Check for active upload on mount
  React.useEffect(() => {
    const saveTaskId = localStorage.getItem(STORAGE_KEY_TASK_ID);
    const saveFileName = localStorage.getItem(STORAGE_KEY_FILE_NAME);

    if (saveTaskId && saveFileName) {
      console.log('Found active upload session, resuming...', saveTaskId);
      // Resume polling
      pollTaskStatus(saveTaskId, saveFileName);
    }
  }, [pollTaskStatus]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset State
    setProcessingStatus('uploading');
    setProgressMessage('Uploading document...');
    setErrorMessage('');

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'docx', 'pptx', 'xlsx', 'csv'];

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension || '')) {
      showToast('Invalid file type. Please upload PDF, Word, PowerPoint, Excel, or CSV.', 'error');
      setProcessingStatus('idle');
      return;
    }

    try {
      // 1. Initiate Upload (Async)
      console.log('Starting upload request...');
      const uploadRes = await businessSetupAPI.uploadKnowledgeDocument(file);
      const taskId = uploadRes.task_id;

      console.log('Upload successful, task ID:', taskId);

      // 2. Persist State
      localStorage.setItem(STORAGE_KEY_TASK_ID, taskId);
      localStorage.setItem(STORAGE_KEY_FILE_NAME, file.name);

      // 3. Start Polling
      pollTaskStatus(taskId, file.name);

    } catch (error: any) {
      console.error('Upload Process Failed:', error);
      setProcessingStatus('error');
      cleanupStorage();

      // Detailed Error Handling
      let msg = 'Failed to process document';
      if (error.message?.includes("409")) {
        msg = `File '${file.name}' has already been processed.`;
        setProcessingStatus('success');
        showToast(msg, 'warning');
      } else if (error.message?.includes("Failed to fetch")) {
        msg = "Cannot reach server. Check your connection.";
      } else {
        msg = error instanceof Error ? error.message : msg;
      }
      setErrorMessage(msg);
      if (!error.message?.includes("409")) showToast(msg, 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.docx,.pptx,.xlsx,.csv"
      />

      {/* Upload & Add Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload Action */}
        {/* File Upload Action - CONDITIONAL RENDER */}
        {processingStatus !== 'idle' ? (
          <div className={`p-4 border rounded-xl transition-all ${processingStatus === 'error' ? 'bg-red-50 border-red-200' :
            processingStatus === 'success' ? 'bg-green-50 border-green-200' :
              'bg-indigo-50 border-indigo-200'
            }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${processingStatus === 'error' ? 'bg-white text-red-500' :
                processingStatus === 'success' ? 'bg-white text-green-500' :
                  'bg-white text-indigo-500'
                }`}>
                {processingStatus === 'uploading' || processingStatus === 'processing' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : processingStatus === 'success' ? (
                  <Check size={18} />
                ) : (
                  <FileText size={18} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className={`text-sm font-semibold ${processingStatus === 'error' ? 'text-red-700' : 'text-slate-900'
                    }`}>
                    {processingStatus === 'error' ? 'Upload Failed' : 'Processing Knowledge'}
                  </h4>
                  <span className="text-xs font-medium text-slate-500">
                    {processingStatus === 'uploading' ? '10%' :
                      processingStatus === 'processing' ? 'Thinking...' :
                        processingStatus === 'success' ? '100%' : 'Failed'}
                  </span>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${processingStatus === 'error' ? 'bg-red-400 w-full' :
                    processingStatus === 'success' ? 'bg-green-400 w-full' :
                      'bg-indigo-500 w-2/3 animate-pulse'
                    }`} />
                </div>

                <p className="text-xs text-slate-500 mt-1.5">
                  {errorMessage || progressMessage}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white border border-slate-200 rounded-lg text-indigo-600 group-hover:border-indigo-500 transition-all shadow-sm">
                <Upload size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Upload Knowledge Base</h4>
                <p className="text-xs text-slate-500 mt-0.5">Upload PDFs, Docs, or Spreadsheets to train your AI.</p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Action */}
        <div
          onClick={() => {
            const newServiceId = `service-${Date.now()}`;
            const newService: Service = {
              id: newServiceId,
              name: "",
              amount: 0,
              priceType: 'flat',
              isExpanded: true
            };
            const updated = [...localServices, newService];
            setLocalServices(updated);
            syncToGlobal(updated);
          }}
          className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-pointer group"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 group-hover:text-slate-900 transition-all">
              <Plus size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Add Manually</h4>
              <p className="text-xs text-slate-500 mt-0.5">Quickly add a service item by hand.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Knowledge Base File List (New UI) */ }
  <AnimatePresence>
    {knowledgeFiles.length > 0 && (
      <div className="space-y-2 mt-4 mb-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2 px-1">
          <Brain size={12} />
          Knowledge Base ({knowledgeFiles.length})
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {knowledgeFiles.map((file) => (
            <m.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${file.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-600' :
                  file.status === 'FAILED' ? 'bg-red-50 text-red-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                  {file.filename.endsWith('.pdf') ? <FileIcon size={16} /> : <FileText size={16} />}
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-800 line-clamp-1 max-w-[200px]">{file.filename}</h5>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    {new Date(file.upload_timestamp).toLocaleDateString()}
                    {file.chunks_count ? `• ${file.chunks_count} chunks` : ''}
                  </p>
                </div>
              </div>

              <div>
                {file.status === 'COMPLETED' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-wide">
                    <Check size={10} /> Trained
                  </span>
                )}
                {file.status === 'FAILED' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-[10px] font-bold rounded-full border border-red-100 uppercase tracking-wide">
                    <AlertCircle size={10} /> Failed
                  </span>
                )}
                {(file.status === 'PROCESSING' || file.status === 'PENDING') && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-wide">
                    <Loader2 size={10} className="animate-spin" /> Training
                  </span>
                )}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    )}
  </AnimatePresence>

  {/* Services List */ }
  <div className="space-y-4 pt-2">
    <div className="flex items-center justify-between px-1">
      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <FileUp className="text-indigo-600 w-4 h-4" />
        Service Items
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {localServices.length}
        </span>
      </h3>
    </div>

    <AnimatePresence mode="popLayout">
      {localServices.length === 0 ? (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="text-slate-300 w-5 h-5" />
          </div>
          <p className="text-slate-500 font-medium text-sm">No services listed yet</p>
          <p className="text-slate-400 text-xs mt-1">Upload a file or add your first service manually.</p>
        </m.div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {localServices.map((service) => (
            <m.div
              key={service.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${service.isExpanded ? 'border-indigo-200 shadow-md ring-1 ring-indigo-100' : 'border-slate-200 shadow-sm hover:border-slate-300'
                }`}
            >
              {/* Card Header */}
              <div
                onClick={() => toggleExpand(service.id)}
                className="p-4 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${service.isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                    {service.isExpanded ? <Edit2 size={16} /> : <Check size={16} />}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${!service.name ? 'text-slate-400 italic' : 'text-slate-900'}`}>
                      {service.name || 'New Service Item'}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      {service.duration && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {service.duration}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        ${service.amount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeService(service.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className={`p-1 text-slate-400 transition-transform duration-300 ${service.isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {service.isExpanded && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 overflow-hidden bg-slate-50/30"
                  >
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Service Name</label>
                          <Input
                            value={service.name}
                            onChange={(e) => updateService(service.id, 'name', e.target.value)}
                            placeholder="e.g. Premium Haircut"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Price ($)</label>
                            <Input
                              type="number"
                              value={service.amount}
                              onChange={(e) => updateService(service.id, 'amount', parseFloat(e.target.value))}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Duration</label>
                            <Input
                              value={service.duration || ''}
                              onChange={(e) => updateService(service.id, 'duration', e.target.value)}
                              placeholder="e.g. 30 min"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                        <TextArea
                          value={service.description || ''}
                          onChange={(e) => updateService(service.id, 'description', e.target.value)}
                          placeholder="Briefly describe what's included..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  </div>
    </div >
  );
};
