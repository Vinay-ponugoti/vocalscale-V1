import React, { useState, useCallback } from 'react';
import {
    Upload, FileText, Check, Loader2,
    AlertCircle, Package, FileSpreadsheet,
    Image, File, X
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../hooks/useToast';
import { businessSetupAPI } from '../../../api/businessSetup';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';

interface InventoryUploadProps {
    onUploadSuccess?: () => void;
}

interface FileUploadItem {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    message: string;
    result?: { imported?: number };
}

const ACCEPTED_EXTENSIONS = [
    '.csv', '.xlsx', '.xls',
    '.pdf',
    '.doc', '.docx',
    '.txt',
    '.jpg', '.jpeg', '.png', '.webp',
];

const ACCEPTED_MIME_TYPES = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

function getFileCategory(filename: string): 'spreadsheet' | 'document' | 'image' | 'text' | 'unknown' {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['csv', 'xlsx', 'xls'].includes(ext)) return 'spreadsheet';
    if (['pdf', 'doc', 'docx'].includes(ext)) return 'document';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
    if (['txt'].includes(ext)) return 'text';
    return 'unknown';
}

function getFileIcon(filename: string) {
    const category = getFileCategory(filename);
    switch (category) {
        case 'spreadsheet': return <FileSpreadsheet size={18} className="text-green-600" />;
        case 'document': return <FileText size={18} className="text-blue-600" />;
        case 'image': return <Image size={18} className="text-purple-600" />;
        case 'text': return <FileText size={18} className="text-slate-600" />;
        default: return <File size={18} className="text-slate-400" />;
    }
}

function getCategoryLabel(filename: string): string {
    const category = getFileCategory(filename);
    switch (category) {
        case 'spreadsheet': return 'Inventory Data';
        case 'document': return 'Knowledge Document';
        case 'image': return 'Image (OCR)';
        case 'text': return 'Text Document';
        default: return 'File';
    }
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const InventoryUpload: React.FC<InventoryUploadProps> = ({ onUploadSuccess }) => {
    const { showToast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { state } = useBusinessSetup();
    const businessCategory = state.data.business.category || 'other';

    const [files, setFiles] = useState<FileUploadItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const validateFile = (file: File): string | null => {
        const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
        if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_MIME_TYPES.includes(file.type)) {
            return `Unsupported file type: ${ext}`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File too large (max 25MB). Size: ${formatFileSize(file.size)}`;
        }
        return null;
    };

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles);
        const items: FileUploadItem[] = [];

        for (const file of fileArray) {
            const error = validateFile(file);
            if (error) {
                showToast(error, 'error');
                continue;
            }
            // Skip duplicates
            if (files.some(f => f.file.name === file.name && f.file.size === file.size)) continue;
            items.push({ file, status: 'pending', message: '' });
        }

        if (items.length > 0) {
            setFiles(prev => [...prev, ...items]);
        }
    }, [files, showToast]);

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            addFiles(e.dataTransfer.files);
        }
    };

    const uploadAllFiles = async () => {
        const pendingFiles = files.filter(f => f.status === 'pending');
        if (pendingFiles.length === 0) return;

        setIsUploading(true);
        let successCount = 0;
        let totalImported = 0;

        for (let i = 0; i < files.length; i++) {
            if (files[i].status !== 'pending') continue;

            // Mark as uploading
            setFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, status: 'uploading' as const, message: 'Uploading...' } : f
            ));

            try {
                const file = files[i].file;
                const category = getFileCategory(file.name);

                let result: { imported?: number; message?: string } = {};

                if (category === 'spreadsheet') {
                    // CSV/Excel → inventory upload endpoint
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('industry', businessCategory);
                    const res = await businessSetupAPI.uploadInventory(formData);
                    result = { imported: res.imported, message: `Imported ${res.imported} items` };
                    totalImported += res.imported || 0;
                } else {
                    // PDF/DOCX/Images/Text → knowledge document upload
                    const res = await businessSetupAPI.uploadKnowledgeDocument(file);
                    result = { message: res.message || 'Uploaded to knowledge base' };
                }

                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'success' as const, message: result.message || 'Uploaded successfully', result } : f
                ));
                successCount++;
            } catch (error: any) {
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'error' as const, message: error.message || 'Upload failed' } : f
                ));
            }
        }

        setIsUploading(false);

        if (successCount > 0) {
            const msg = totalImported > 0
                ? `Uploaded ${successCount} file(s), imported ${totalImported} inventory items`
                : `Uploaded ${successCount} file(s) to knowledge base`;
            showToast(msg, 'success');
            if (onUploadSuccess) onUploadSuccess();
        }
    };

    const hasFiles = files.length > 0;
    const hasPending = files.some(f => f.status === 'pending');
    const allDone = hasFiles && files.every(f => f.status === 'success' || f.status === 'error');

    return (
        <div className="space-y-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="hidden"
                accept={ACCEPTED_EXTENSIONS.join(',')}
                multiple
            />

            {/* Drop Zone */}
            <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
                    isDragging
                        ? 'border-indigo-400 bg-indigo-50/50 scale-[1.01]'
                        : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30'
                } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
            >
                <div className={`p-3 rounded-full border transition-all shadow-sm ${
                    isDragging ? 'bg-indigo-100 border-indigo-300 text-indigo-600' : 'bg-white border-slate-200 text-indigo-600'
                }`}>
                    <Upload size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                        {isDragging ? 'Drop files here' : 'Upload Inventory & Knowledge Files'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                        CSV, Excel, PDF, Word, Images, or Text — drag & drop or click to browse
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                        Spreadsheets import as inventory items. Other files are added to AI knowledge base. Max 25MB.
                    </p>
                </div>
            </div>

            {/* File List */}
            <AnimatePresence>
                {hasFiles && (
                    <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        {files.map((item, index) => (
                            <m.div
                                key={`${item.file.name}-${index}`}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                    item.status === 'success' ? 'bg-green-50 border-green-200' :
                                    item.status === 'error' ? 'bg-red-50 border-red-200' :
                                    item.status === 'uploading' ? 'bg-indigo-50 border-indigo-200' :
                                    'bg-white border-slate-200'
                                }`}
                            >
                                {/* File Icon */}
                                <div className={`p-2 rounded-lg shrink-0 ${
                                    item.status === 'success' ? 'bg-green-100' :
                                    item.status === 'error' ? 'bg-red-100' :
                                    item.status === 'uploading' ? 'bg-indigo-100' :
                                    'bg-slate-100'
                                }`}>
                                    {item.status === 'uploading' ? (
                                        <Loader2 size={18} className="text-indigo-600 animate-spin" />
                                    ) : item.status === 'success' ? (
                                        <Check size={18} className="text-green-600" />
                                    ) : item.status === 'error' ? (
                                        <AlertCircle size={18} className="text-red-600" />
                                    ) : (
                                        getFileIcon(item.file.name)
                                    )}
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-slate-900 truncate">{item.file.name}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                                            getFileCategory(item.file.name) === 'spreadsheet'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {getCategoryLabel(item.file.name)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {item.message || formatFileSize(item.file.size)}
                                    </p>
                                </div>

                                {/* Remove Button (only for pending/error) */}
                                {(item.status === 'pending' || item.status === 'error') && !isUploading && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </m.div>
                        ))}

                        {/* Upload Button */}
                        <div className="flex items-center gap-2 pt-1">
                            {hasPending && (
                                <button
                                    onClick={uploadAllFiles}
                                    disabled={isUploading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm shadow-indigo-200"
                                >
                                    {isUploading ? (
                                        <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                                    ) : (
                                        <><Upload size={14} /> Upload {files.filter(f => f.status === 'pending').length} File(s)</>
                                    )}
                                </button>
                            )}
                            {allDone && (
                                <button
                                    onClick={() => setFiles([])}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
                                >
                                    Clear
                                </button>
                            )}
                            {!isUploading && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
                                >
                                    Add More Files
                                </button>
                            )}
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
};
