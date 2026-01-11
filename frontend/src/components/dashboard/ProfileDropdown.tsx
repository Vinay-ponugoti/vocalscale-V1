
import React from 'react';
import { Link } from 'react-router-dom';
import { User, CreditCard, LogOut } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-14 right-0 w-64 bg-white rounded-lg shadow-lg border border-white-light z-50 overflow-hidden"
      onClick={onClose}
    >
      <div className="p-4 border-b border-white-light flex items-center gap-3">
        <div className="overflow-hidden">
          <p className="font-semibold text-charcoal truncate">{displayName}</p>
          <p className="text-xs text-charcoal-light truncate">{email}</p>
        </div>
      </div>
      <div className="py-2">
        <Link
          to="/dashboard/settings"
          className="flex items-center px-4 py-2.5 text-sm font-medium text-charcoal-medium hover:bg-blue-electric/5 hover:text-blue-electric transition-colors"
        >
          <User size={16} className="mr-3" />
          Profile
        </Link>
        <Link
          to="/dashboard/billing"
          className="flex items-center px-4 py-2.5 text-sm font-medium text-charcoal-medium hover:bg-blue-electric/5 hover:text-blue-electric transition-colors"
        >
          <CreditCard size={16} className="mr-3" />
          Billing
        </Link>
      </div>
      <div className="border-t border-white-light py-2">
        <button
          onClick={onSignOut}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} className="mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
