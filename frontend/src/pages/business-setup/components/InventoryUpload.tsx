import React, { useState } from 'react';
import {
    Upload, FileText, Check, Loader2,
    AlertCircle, Package
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../hooks/useToast';
import { businessSetupAPI } from '../../../api/businessSetup';

interface InventoryUploadProps {
    onUploadSuccess?: () => void;
}

export const InventoryUpload: React.FC<InventoryUploadProps> = ({ onUploadSuccess }) => {
    const { showToast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [progressMessage, setProgressMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [industry, setIndustry] = useState<'liquor' | 'vape'>('liquor');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset State
        setProcessingStatus('uploading');
        setProgressMessage('Uploading inventory...');
        setErrorMessage('');

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!validTypes.includes(file.type) && !['xlsx', 'csv'].includes(extension || '')) {
            showToast('Invalid file type. Please upload Excel or CSV.', 'error');
            setProcessingStatus('idle');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('industry', industry);

            // We need to add this method to businessSetupAPI
            const uploadRes = await businessSetupAPI.uploadInventory(formData);

            setProcessingStatus('success');
            setProgressMessage(`Successfully imported ${uploadRes.imported} items!`);
            showToast(`Imported ${uploadRes.imported} items!`, 'success');

            if (onUploadSuccess) onUploadSuccess();

            // Reset after delay
            setTimeout(() => {
                setProcessingStatus('idle');
                setProgressMessage('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            }, 3000);

        } catch (error: any) {
            console.error('Upload Process Failed:', error);
            setProcessingStatus('error');
            setErrorMessage(error.message || 'Failed to process inventory');
            showToast('Inventory import failed.', 'error');
        }
    };

    return (
        <div className="space-y-6">

            {/* Industry Selector */}
            <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-slate-700">Industry Type:</label>
                <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as 'liquor' | 'vape')}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                    <option value="liquor">Liquor Store</option>
                    <option value="vape">Vape Shop</option>
                </select>
            </div>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".xlsx,.csv"
            />

            {/* Upload UI */}
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
                                <AlertCircle size={18} />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-sm font-semibold ${processingStatus === 'error' ? 'text-red-700' : 'text-slate-900'
                                }`}>
                                {processingStatus === 'error' ? 'Import Failed' : 'Importing Inventory'}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                                {errorMessage || progressMessage}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-2"
                >
                    <div className="p-3 bg-white border border-slate-200 rounded-full text-indigo-600 group-hover:border-indigo-500 transition-all shadow-sm">
                        <Package size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-900">Upload Inventory File</h4>
                        <p className="text-xs text-slate-500 mt-1">Accepts CSV or Excel. Will be added to AI Knowledge Base.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
