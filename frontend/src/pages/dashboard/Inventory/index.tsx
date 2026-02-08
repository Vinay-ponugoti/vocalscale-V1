import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { InventoryUpload } from '../../../pages/business-setup/components/InventoryUpload';
import {
    Search,
    Filter,
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
    Building
} from 'lucide-react';
import { businessSetupAPI } from '../../../api/businessSetup';
import { useBusinessSetup } from '../../../context/BusinessSetupContext';
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
}

const Inventory = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUpload, setShowUpload] = useState(false);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            // We need to implement getInventory in API client
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

    const { state } = useBusinessSetup();
    const businessCategory = state.data.business.category || 'other';

    const getCategoryIcon = (itemCategory: string) => {
        // First check item category, then fallback to business category if item category is generic
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

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sub_category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Management</h1>
                        <p className="text-slate-500 mt-1">Manage your products and train the AI on your stock.</p>
                    </div>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${showUpload ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        {showUpload ? 'Cancel Upload' : <><Plus size={18} /> Import Inventory</>}
                    </button>
                </div>

                <AnimatePresence>
                    {showUpload && (
                        <m.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden"
                        >
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Import Products</h3>
                            <InventoryUpload onUploadSuccess={() => {
                                setShowUpload(false);
                                fetchInventory();
                            }} />
                        </m.div>
                    )}
                </AnimatePresence>

                {/* Search & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, brand, or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between px-6">
                        <span className="text-slate-500 font-medium">Total Items</span>
                        <span className="text-2xl font-bold text-slate-900">{items.length}</span>
                    </div>
                </div>

                {/* Inventory List */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Loading inventory...</div>
                    ) : filteredItems.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Package size={32} />
                            </div>
                            <h3 className="text-slate-900 font-medium mb-1">No items found</h3>
                            <p className="text-slate-500 text-sm">Upload your inventory to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Product Name</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3">Stock</th>
                                        <th className="px-6 py-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{item.name}</div>
                                                <div className="text-xs text-slate-500">{item.brand}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getCategoryIcon(item.category)}
                                                    <span className="capitalize text-slate-700">{item.sub_category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                ${item.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.stock_status?.toLowerCase().includes('out')
                                                    ? 'bg-red-50 text-red-700'
                                                    : 'bg-green-50 text-green-700'
                                                    }`}>
                                                    {item.stock_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                                                {Object.entries(item.details || {}).map(([k, v]) => (
                                                    <span key={k} className="mr-2 capitalize">
                                                        <span className="font-semibold text-slate-700">{k}:</span> {v as string}
                                                    </span>
                                                ))}
                                            </td>
                                        </tr>
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
