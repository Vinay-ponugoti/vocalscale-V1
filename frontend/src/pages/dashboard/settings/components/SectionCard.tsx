import React from 'react';
import type { SectionCardProps } from '../../../../types/settings';

export const SectionCard = ({ title, subtitle, children, action, icon, isLast }: SectionCardProps) => (
  <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all duration-300 ${!isLast ? 'mb-8' : ''}`}>
    <div className="p-6 md:p-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-5">
          {icon && (
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-slate-500 mt-1.5 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-2xl opacity-70">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  </div>
);
