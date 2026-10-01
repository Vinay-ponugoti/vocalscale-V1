import React from 'react';

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const SectionCard = ({ title, subtitle, children, action, icon }: SectionCardProps) => (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 overflow-hidden">
    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="flex items-center gap-3">
        {icon && <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">{icon}</div>}
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={`block text-sm font-medium text-slate-700 mb-1.5 ${className || ''}`}>{children}</label>
);

export const Toggle = ({ active, onChange }: { active: boolean; onChange?: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${active ? 'bg-blue-600' : 'bg-slate-300'}`}
  >
    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-1'}`} />
  </button>
);

export const SecondaryButton = ({ children, onClick, size = 'default' }: { children: React.ReactNode; onClick?: () => void; size?: 'default' | 'small' }) => (
  <button
    onClick={onClick}
    className={`bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors ${size === 'small' ? 'px-3 py-1.5 rounded-md text-xs' : 'px-3 py-2 rounded-lg'}`}
  >
    {children}
  </button>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
  />
);
