import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { InventoryUpload } from '../../../pages/business-setup/components/InventoryUpload';
import { Package, Search, Filter, Wine, ShoppingBag, Plus, Calendar, ArrowUpRight } from 'lucide-react';
import { businessSetupAPI } from '../../../api/businessSetup';
import { m, AnimatePresence } from 'framer-motion';

interface InventoryItem {
    id: string;
    name: string;
    brand: string;
    category: string;
    sub_category: string;
    price: number;
    stock_status: string;
    details: any;
    created_at?: string;
}

const Inventory = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUpload, setShowUpload] = useState(false);

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

    useEffect(() => {
        fetchInventory();
    }, []);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sub_category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group items by category for stats
    const stats = {
        total: items.length,
        value: items.reduce((acc, item) => acc + (item.price || 0), 0),
        lowStock: items.filter(i => i.stock_status?.toLowerCase().includes('low') || i.stock_status?.toLowerCase().includes('out')).length
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory</h1>
                        <p className="text-slate-500 mt-2 text-lg">Manage products and train your AI agent on stock knowledge.</p>
                    </div>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm ${showUpload
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                    >
                        {showUpload ? 'Cancel Upload' : <><Plus size={20} strokeWidth={2.5} /> Import Inventory</>}
                    </button>
                </div>

                {/* Upload Section */}
                <AnimatePresence>
                    {showUpload && (
                        <m.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white border border-indigo-100 rounded-2xl p-8 shadow-xl shadow-indigo-50/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 opacity-50" />
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                            <ArrowUpRight size={20} />
                                        </div>
                                        Import Products
                                    </h3>
                                    <InventoryUpload onUploadSuccess={() => {
                                        setShowUpload(false);
                                        fetchInventory();
                                    }} />
                                </div>
                            </div>
                        </m.div>
                    )}
                </AnimatePresence>

                {/* Search & Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, brand, or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm text-lg"
                        />
                    </div>

                    {/* Mini Stats */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Items</p>
                            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                            <Package size={24} />
                        </div>
                    </div>
                </div>

                {/* Inventory List */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Loading your inventory...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-20 text-center max-w-md mx-auto">
                            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 transform rotate-3">
                                <Package size={48} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No items found</h3>
                            <p className="text-slate-500 mb-8">
                                {searchQuery ? 'Try adjusting your search terms.' : 'Upload your inventory list to get started. The AI will learn these products instantly.'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Import First Product
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/80 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map((item, i) => (
                                        <m.tr
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-slate-50/80 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</div>
                                                {item.brand && (
                                                    <div className="text-xs font-medium text-slate-500 mt-0.5 bg-slate-100 inline-block px-2 py-0.5 rounded-md">
                                                        {item.brand}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {item.category === 'liquor' ? (
                                                        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                                                            <Wine size={16} />
                                                        </div>
                                                    ) : (
                                                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                                            <ShoppingBag size={16} />
                                                        </div>
                                                    )}
                                                    <span className="capitalize font-medium text-slate-700">
                                                        {item.sub_category || item.category}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-medium text-slate-900">
                                                    ${item.price?.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${item.stock_status?.toLowerCase().includes('out')
                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                        : item.stock_status?.toLowerCase().includes('low')
                                                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    }`}>
                                                    {item.stock_status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(item.details || {}).slice(0, 3).map(([k, v]) => (
                                                        <div key={k} className="text-xs px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-600 flex items-center gap-1 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                            <span className="font-semibold text-slate-400 uppercase text-[9px]">{k}:</span>
                                                            <span className="font-medium truncate max-w-[100px]">{v as string}</span>
                                                        </div>
                                                    ))}
                                                    {Object.keys(item.details || {}).length > 3 && (
                                                        <span className="text-xs text-slate-400 px-1 py-1">+{Object.keys(item.details || {}).length - 3}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </m.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Inventory;
