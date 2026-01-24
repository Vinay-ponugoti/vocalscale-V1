import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Basic styles for react-day-picker if not globally imported
import 'react-day-picker/dist/style.css';

interface CalendarPickerProps {
    date: Date;
    setDate: (date: Date) => void;
    maxDate?: Date;
    timezone?: string;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ date, setDate, maxDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDate(selectedDate);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm transition-all text-charcoal-medium hover:bg-white-light hover:text-charcoal active:scale-95",
                    isOpen ? "border-blue-electric ring-2 ring-blue-electric/10" : "border-white-light"
                )}
            >
                <CalendarIcon size={18} className="text-charcoal-light" />
                <span className="text-sm font-bold min-w-[100px] text-left">
                    {format(date, 'MMM dd, yyyy')}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 z-50 bg-white border border-slate-100 rounded-xl shadow-xl p-4 min-w-[320px]"
                    >
                        <DayPicker
                            mode="single"
                            selected={date}
                            onSelect={handleSelect}
                            disabled={maxDate ? { after: maxDate } : undefined}
                            showOutsideDays
                            className="p-0"
                            classNames={{
                                day_button: "hover:bg-slate-100 rounded-full",
                                selected: "bg-blue-electric text-white hover:bg-blue-electric/90",
                                today: "text-blue-electric font-bold",
                                chevron: "fill-blue-electric"
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalendarPicker;
