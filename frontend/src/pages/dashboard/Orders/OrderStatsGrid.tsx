import {
    ShoppingBag,
    CheckCircle,
    XCircle,
    DollarSign,
} from 'lucide-react';
import type { OrderStats } from '../../../api/orders';

interface OrderStatsGridProps {
    stats: OrderStats;
}

export const OrderStatsGrid = ({ stats }: OrderStatsGridProps) => {
    const totalRevenue = (stats.confirmed * 25);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <ShoppingBag size={16} className="text-indigo-600" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Total Orders</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.confirmed}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Confirmed</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <XCircle size={16} className="text-red-600" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.cancelled}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Cancelled</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <DollarSign size={16} className="text-purple-600" />
                    </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(0)}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Revenue</p>
            </div>
        </div>
    );
};
