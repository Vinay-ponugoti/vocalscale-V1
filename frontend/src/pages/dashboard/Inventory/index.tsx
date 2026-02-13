import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { InventoryUpload } from '../../../pages/business-setup/components/InventoryUpload';
import {
    Search,
    Plus,
    Package,
    Wine,
    ShoppingBag,
    Zap,
    Stethoscope,
    Car,
    Home,
    Gavel,
    Smartphone,
    Utensils,
    Pencil,
    Trash2,
    X,
    Check,
    AlertTriangle,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    TrendingUp,
    AlertCircle,
    PackageCheck,
    ChevronsLeft,
    ChevronsRight,
    FileText,
    FileSpreadsheet,
    Image,
    Loader2,
    RefreshCw,
    Brain,
} from 'lucide-react';
import { businessSetupAPI } from '../../../api/businessSetup';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
import { m, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface InventoryItem {
    id: string;
    name: string;
    brand: string;
    category: string;
    sub_category: string;
    price: number;
    stock_status: string;
    sku: string;
    size: string;
    details: any;
}

type SortField = 'name' | 'price' | 'stock_status' | 'sub_category';
type SortDirection = 'asc' | 'desc';

const Inventory = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUpload, setShowUpload] = useState(false);

    // Sort state
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<InventoryItem>>({});
    const [saving, setSaving] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Delete state
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Knowledge files state
    const [knowledgeFiles, setKnowledgeFiles] = useState<Array<{
        id: string;
        filename: string;
        status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
        upload_timestamp: string;
        size_bytes?: number;
        error?: string;
    }>>([]);
    const [knowledgeLoading, setKnowledgeLoading] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await businessSetupAPI.getInventory();
            setItems(res.items || []);
        } catch (error) {
            console.error("Failed to load inventory", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchKnowledgeFiles = async () => {
        setKnowledgeLoading(true);
        try {
            const files = await businessSetupAPI.getKnowledgeFiles();
            setKnowledgeFiles(files);
        } catch (error) {
            console.error("Failed to load knowledge files", error);
        } finally {
            setKnowledgeLoading(false);
        }
    };

    const deleteKnowledgeFile = async (fileId: string) => {
        try {
            await businessSetupAPI.deleteKnowledgeFile(fileId);
            setKnowledgeFiles(prev => prev.filter(f => f.id !== fileId));
            setDeletingFileId(null);
        } catch (error) {
            console.error("Failed to delete knowledge file", error);
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchKnowledgeFiles();
    }, []);

    const { state } = useBusinessSetup();
    const businessCategory = state.data.business.category || 'other';

    const getCategoryIcon = (itemCategory: string) => {
        const cat = itemCategory?.toLowerCase() || businessCategory;
        switch (cat) {
            case 'liquor': return <Wine size={14} className="text-purple-500" />;
            case 'vape': return <Zap size={14} className="text-amber-500" />;
            case 'dining': return <Utensils size={14} className="text-orange-500" />;
            case 'healthcare': return <Stethoscope size={14} className="text-blue-500" />;
            case 'automotive':
            case 'autocare': return <Car size={14} className="text-slate-600" />;
            case 'retail': return <ShoppingBag size={14} className="text-indigo-500" />;
            case 'realestate': return <Home size={14} className="text-emerald-500" />;
            case 'legal': return <Gavel size={14} className="text-brown-500" />;
            case 'saas': return <Smartphone size={14} className="text-cyan-500" />;
            default: return <Package size={14} className="text-slate-400" />;
        }
    };

    // ---------- Edit handlers ----------
    const startEdit = (item: InventoryItem) => {
        setEditingId(item.id);
        setEditForm({ name: item.name, brand: item.brand, price: item.price, stock_status: item.stock_status, sub_category: item.sub_category });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async () => {
        if (!editingId) return;
        setSaving(true);
        try {
            const res = await businessSetupAPI.updateInventoryItem(editingId, editForm);
            setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...res.item } : i));
            setEditingId(null);
            setEditForm({});
        } catch (error) {
            console.error('Failed to update item', error);
        } finally {
            setSaving(false);
        }
    };

    // ---------- Delete handlers ----------
    const deleteItem = async (id: string) => {
        setDeleting(true);
        try {
            await businessSetupAPI.deleteInventoryItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
            setDeletingId(null);
        } catch (error) {
            console.error('Failed to delete item', error);
        } finally {
            setDeleting(false);
        }
    };

    // ---------- Sort handler ----------
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300" />;
        return sortDirection === 'asc'
            ? <ChevronUp size={12} className="text-indigo-500" />
            : <ChevronDown size={12} className="text-indigo-500" />;
    };

    // ---------- Computed data ----------
    const filteredItems = useMemo(() => {
        let result = items.filter(item =>
            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sub_category?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        result.sort((a, b) => {
            let aVal: string | number = '';
            let bVal: string | number = '';

            switch (sortField) {
                case 'name': aVal = a.name?.toLowerCase() || ''; bVal = b.name?.toLowerCase() || ''; break;
                case 'price': aVal = a.price || 0; bVal = b.price || 0; break;
                case 'stock_status': aVal = a.stock_status?.toLowerCase() || ''; bVal = b.stock_status?.toLowerCase() || ''; break;
                case 'sub_category': aVal = a.sub_category?.toLowerCase() || ''; bVal = b.sub_category?.toLowerCase() || ''; break;
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [items, searchQuery, sortField, sortDirection]);

    // Reset to page 1 when search or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortField, sortDirection]);

    // Paginated items
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    const stats = useMemo(() => {
        const inStock = items.filter(i => i.stock_status?.toLowerCase().includes('in stock') || (!i.stock_status?.toLowerCase().includes('out') && !i.stock_status?.toLowerCase().includes('low'))).length;
        const lowStock = items.filter(i => i.stock_status?.toLowerCase().includes('low')).length;
        const outOfStock = items.filter(i => i.stock_status?.toLowerCase().includes('out')).length;
        const totalValue = items.reduce((sum, i) => sum + (i.price || 0), 0);
        return { inStock, lowStock, outOfStock, totalValue };
    }, [items]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory</h1>
                        <p className="text-slate-500 mt-1 text-sm">Manage products and keep your AI trained on current stock.</p>
                    </div>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm shadow-sm ${showUpload
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                            }`}
                    >
                        {showUpload ? (
                            <><X size={16} /> Cancel</>
                        ) : (
                            <><Plus size={16} /> Import Inventory</>
                        )}
                    </button>
                </div>

                {/* Upload Panel */}
                <AnimatePresence>
                    {showUpload && (
                        <m.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                        >
                            <h3 className="text-base font-semibold mb-1 text-slate-900">Import Products & Knowledge</h3>
                            <p className="text-xs text-slate-500 mb-4">Upload spreadsheets for inventory, or PDFs/docs/images to train your AI agent.</p>
                            <InventoryUpload onUploadSuccess={() => {
                                setShowUpload(false);
                                fetchInventory();
                                fetchKnowledgeFiles();
                            }} />
                        </m.div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                {items.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <Package size={16} className="text-indigo-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{items.length}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Total Products</p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                    <PackageCheck size={16} className="text-green-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{stats.inStock}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">In Stock</p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <AlertCircle size={16} className="text-amber-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{stats.lowStock + stats.outOfStock}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Needs Attention</p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                    <TrendingUp size={16} className="text-slate-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Total Value</p>
                        </div>
                    </div>
                )}

                {/* Search */}
                {items.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, brand, or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                )}

                {/* Inventory Table */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">Loading inventory...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Package size={28} className="text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-semibold mb-1">No products yet</h3>
                            <p className="text-slate-500 text-sm mb-4">Import your inventory to get started.</p>
                            <button
                                onClick={() => setShowUpload(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
                            >
                                <Plus size={16} /> Import Inventory
                            </button>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search size={20} className="text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-medium mb-1">No results found</h3>
                            <p className="text-slate-500 text-sm">Try a different search term.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/80 border-b border-slate-200">
                                        <tr>
                                            <th
                                                className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors select-none"
                                                onClick={() => handleSort('name')}
                                            >
                                                <span className="inline-flex items-center gap-1.5">
                                                    Product <SortIcon field="name" />
                                                </span>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors select-none"
                                                onClick={() => handleSort('sub_category')}
                                            >
                                                <span className="inline-flex items-center gap-1.5">
                                                    Category <SortIcon field="sub_category" />
                                                </span>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors select-none"
                                                onClick={() => handleSort('price')}
                                            >
                                                <span className="inline-flex items-center gap-1.5">
                                                    Price <SortIcon field="price" />
                                                </span>
                                            </th>
                                            <th
                                                className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors select-none"
                                                onClick={() => handleSort('stock_status')}
                                            >
                                                <span className="inline-flex items-center gap-1.5">
                                                    Stock <SortIcon field="stock_status" />
                                                </span>
                                            </th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                {editingId === item.id ? (
                                                    <>
                                                        <td className="px-6 py-3">
                                                            <input
                                                                value={editForm.name || ''}
                                                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                                                className="w-full px-2.5 py-1.5 border border-indigo-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-indigo-50/30"
                                                                autoFocus
                                                            />
                                                            <input
                                                                value={editForm.brand || ''}
                                                                onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))}
                                                                placeholder="Brand"
                                                                className="w-full px-2.5 py-1 mt-1.5 border border-slate-200 rounded-lg text-xs text-slate-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <input
                                                                value={editForm.sub_category || ''}
                                                                onChange={e => setEditForm(f => ({ ...f, sub_category: e.target.value }))}
                                                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <div className="relative">
                                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={editForm.price ?? 0}
                                                                    onChange={e => setEditForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                                                                    className="w-24 pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <select
                                                                value={editForm.stock_status || 'unknown'}
                                                                onChange={e => setEditForm(f => ({ ...f, stock_status: e.target.value }))}
                                                                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white"
                                                            >
                                                                <option value="In Stock">In Stock</option>
                                                                <option value="Out of Stock">Out of Stock</option>
                                                                <option value="Low Stock">Low Stock</option>
                                                                <option value="unknown">Unknown</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-3 text-xs text-slate-400">—</td>
                                                        <td className="px-6 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button onClick={saveEdit} disabled={saving} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors" title="Save">
                                                                    <Check size={15} />
                                                                </button>
                                                                <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors" title="Cancel">
                                                                    <X size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : deletingId === item.id ? (
                                                    <>
                                                        <td colSpan={5} className="px-6 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangle size={14} className="text-red-500 shrink-0" />
                                                                <span className="text-sm text-red-700 font-medium">Delete "{item.name}"?</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button onClick={() => setDeletingId(null)} className="px-2.5 py-1 text-xs rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium">Cancel</button>
                                                                <button onClick={() => deleteItem(item.id)} disabled={deleting} className="px-2.5 py-1 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-medium">
                                                                    {deleting ? '...' : 'Delete'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-900">{item.name}</div>
                                                            {item.brand && <div className="text-xs text-slate-400 mt-0.5">{item.brand}</div>}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {getCategoryIcon(item.category)}
                                                                <span className="capitalize text-slate-600 text-sm">{item.sub_category}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-semibold text-slate-900">${(item.price || 0).toFixed(2)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${item.stock_status?.toLowerCase().includes('out')
                                                                ? 'bg-red-50 text-red-700 ring-1 ring-red-100'
                                                                : item.stock_status?.toLowerCase().includes('low')
                                                                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                                                                    : 'bg-green-50 text-green-700 ring-1 ring-green-100'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${item.stock_status?.toLowerCase().includes('out')
                                                                    ? 'bg-red-500'
                                                                    : item.stock_status?.toLowerCase().includes('low')
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-green-500'
                                                                    }`} />
                                                                {item.stock_status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 text-xs max-w-[200px]">
                                                            <div className="flex flex-wrap gap-1">
                                                                {Object.entries(item.details || {}).slice(0, 3).map(([k, v]) => (
                                                                    <span key={k} className="inline-flex items-center px-1.5 py-0.5 bg-slate-50 rounded text-[10px] font-medium text-slate-600">
                                                                        <span className="text-slate-400 mr-0.5">{k}:</span> {v as string}
                                                                    </span>
                                                                ))}
                                                                {Object.keys(item.details || {}).length > 3 && (
                                                                    <span className="text-[10px] text-slate-400">+{Object.keys(item.details).length - 3} more</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Edit">
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Table footer with pagination */}
                            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <p className="text-xs text-slate-400">
                                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)}–{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length}
                                        {filteredItems.length !== items.length && ` (filtered from ${items.length})`}
                                    </p>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 bg-white outline-none focus:ring-1 focus:ring-indigo-500/20"
                                    >
                                        <option value={10}>10 / page</option>
                                        <option value={25}>25 / page</option>
                                        <option value={50}>50 / page</option>
                                        <option value={100}>100 / page</option>
                                    </select>
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="First page"
                                        >
                                            <ChevronsLeft size={14} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="Previous page"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>

                                        {/* Page numbers */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(page => {
                                                if (totalPages <= 7) return true;
                                                if (page === 1 || page === totalPages) return true;
                                                if (Math.abs(page - currentPage) <= 1) return true;
                                                return false;
                                            })
                                            .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                                                if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                                                acc.push(page);
                                                return acc;
                                            }, [])
                                            .map((page, idx) =>
                                                page === 'ellipsis' ? (
                                                    <span key={`e-${idx}`} className="px-1 text-xs text-slate-300">...</span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page as number)}
                                                        className={`min-w-[28px] h-7 rounded-lg text-xs font-medium transition-colors ${
                                                            currentPage === page
                                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            )}

                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="Next page"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="Last page"
                                        >
                                            <ChevronsRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Knowledge Files Section */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Brain size={16} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">AI Knowledge Files</h3>
                                <p className="text-xs text-slate-500">Documents uploaded to train your AI agent on products & services</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchKnowledgeFiles}
                            disabled={knowledgeLoading}
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={14} className={knowledgeLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {knowledgeLoading && knowledgeFiles.length === 0 ? (
                        <div className="p-8 text-center">
                            <Loader2 size={20} className="text-slate-300 animate-spin mx-auto mb-2" />
                            <p className="text-xs text-slate-400">Loading knowledge files...</p>
                        </div>
                    ) : knowledgeFiles.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <FileText size={20} className="text-slate-300" />
                            </div>
                            <p className="text-sm text-slate-500 font-medium">No knowledge files uploaded</p>
                            <p className="text-xs text-slate-400 mt-1">Upload PDFs, documents, or images to give your AI agent more context.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {knowledgeFiles.map((file) => {
                                const ext = file.filename.split('.').pop()?.toLowerCase() || '';
                                const isSpreadsheet = ['csv', 'xlsx', 'xls'].includes(ext);
                                const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
                                const isPdf = ext === 'pdf';

                                return (
                                    <div key={file.id} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors group">
                                        {/* File Icon */}
                                        <div className={`p-2 rounded-lg shrink-0 ${
                                            isSpreadsheet ? 'bg-green-50' :
                                            isPdf ? 'bg-red-50' :
                                            isImage ? 'bg-purple-50' :
                                            'bg-blue-50'
                                        }`}>
                                            {isSpreadsheet ? <FileSpreadsheet size={16} className="text-green-600" /> :
                                             isPdf ? <FileText size={16} className="text-red-600" /> :
                                             isImage ? <Image size={16} className="text-purple-600" /> :
                                             <FileText size={16} className="text-blue-600" />}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{file.filename}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {file.size_bytes && (
                                                    <span className="text-[10px] text-slate-400">
                                                        {file.size_bytes < 1024 * 1024
                                                            ? `${(file.size_bytes / 1024).toFixed(1)} KB`
                                                            : `${(file.size_bytes / (1024 * 1024)).toFixed(1)} MB`
                                                        }
                                                    </span>
                                                )}
                                                {file.upload_timestamp && (
                                                    <span className="text-[10px] text-slate-400">
                                                        {format(new Date(file.upload_timestamp), 'MMM d, h:mm a')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                                            file.status === 'COMPLETED' ? 'bg-green-50 text-green-700 ring-1 ring-green-100' :
                                            file.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' :
                                            file.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100' :
                                            'bg-red-50 text-red-700 ring-1 ring-red-100'
                                        }`}>
                                            {file.status === 'PROCESSING' && <Loader2 size={10} className="animate-spin" />}
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                file.status === 'COMPLETED' ? 'bg-green-500' :
                                                file.status === 'PROCESSING' ? 'bg-blue-500' :
                                                file.status === 'PENDING' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`} />
                                            {file.status === 'COMPLETED' ? 'Trained' :
                                             file.status === 'PROCESSING' ? 'Processing' :
                                             file.status === 'PENDING' ? 'Pending' : 'Failed'}
                                        </span>

                                        {/* Delete */}
                                        {deletingFileId === file.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => deleteKnowledgeFile(file.id)}
                                                    className="px-2 py-1 text-[10px] rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => setDeletingFileId(null)}
                                                    className="px-2 py-1 text-[10px] rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeletingFileId(file.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete file"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Inventory;
