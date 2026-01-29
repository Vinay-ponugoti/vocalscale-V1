import React from 'react';
import { Link } from 'react-router-dom';
import { User, CreditCard, LogOut, Settings, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  onSignOut,
  displayName,
  email,
  avatarUrl,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile or just to handle outside clicks cleanly */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="absolute top-14 right-0 w-72 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/50 ring-1 ring-slate-100 z-50 overflow-hidden origin-top-right"
          >
            {/* Header Section */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20 ring-2 ring-white">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="font-bold text-sm text-slate-900 truncate leading-tight mb-0.5">{displayName}</p>
                  <p className="text-xs font-medium text-slate-500 truncate leading-tight">{email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-1.5 space-y-0.5">
              <Link
                to="/dashboard/settings"
                onClick={onClose}
                className="group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <User size={16} />
                  </div>
                  <span>Profile Settings</span>
                </div>
                <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-400" />
              </Link>

              <Link
                to="/dashboard/billing"
                onClick={onClose}
                className="group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <CreditCard size={16} />
                  </div>
                  <span>Billing & Plans</span>
                </div>
                <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-400" />
              </Link>
            </div>

            <div className="h-px bg-slate-100 mx-4 my-1" />

            {/* Footer / Sign Out */}
            <div className="p-1.5">
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="group w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-red-50 text-red-500 group-hover:bg-white group-hover:text-red-600 transition-colors">
                    <LogOut size={16} />
                  </div>
                  <span>Sign Out</span>
                </div>
              </button>
            </div>

            {/* version/legal tiny footer */}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;
