import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCcw } from 'lucide-react';
import Input from '../../../../components/ui/InputField';
import { Button } from '../../../../components/ui/Button';

interface LogFiltersProps {
  filters: {
    search: string;
    status: string;
    type: string;
    dateRange: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

// Helper for the active styling of chips
const getChipStyle = (isActive: boolean) => 
    `h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
      isActive 
        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-100 ring-1 ring-indigo-500/20' 
        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-600 ring-1 ring-slate-900/5'
    }`;

const LogFilters: React.FC<LogFiltersProps> = ({ filters, onFilterChange, onReset }) => {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [prevSearch, setPrevSearch] = useState(filters.search);

  // Sync local search with external changes (like Reset)
  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search);
    setLocalSearch(filters.search);
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange('search', localSearch);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [localSearch, onFilterChange, filters.search]);

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Reset */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10" 
            size={16} 
          />
          <Input
            label="Search logs"
            type="text"
            placeholder="Search by caller name or phone..."
            className="pl-11 h-12 w-full rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm group-hover:border-slate-300"
            containerClassName="mb-0"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        
        <Button
          variant="ghost"
          onClick={onReset}
          className="h-12 px-5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border-transparent hover:border-indigo-100 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
          title="Reset filters"
        >
          <RefreshCcw size={16} />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mr-3">
          <Filter size={12} className="text-indigo-400" />
          <span>Filters</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          {(['All', 'Booking', 'Inquiry', 'Urgent', 'General'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange('type', type)}
              className={getChipStyle(filters.type === type)}
            >
              {type}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-2" />

          {/* Date Filter */}
          {(['Today', '7d', '30d', '90d'] as const).map((date) => (
            <button
              key={date}
              onClick={() => onFilterChange('dateRange', date)}
              className={getChipStyle(filters.dateRange === date)}
            >
              {date === '7d' ? 'Last 7 Days' : date === '30d' ? 'Last 30 Days' : date === '90d' ? 'Last 3 Months' : date}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogFilters;