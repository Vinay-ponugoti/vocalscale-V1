import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SectionNavItem<T extends string> {
  id: T;
  label: string;
  description?: string;
  icon: LucideIcon;
  /** Short status on the right, e.g. "Ready" or "5/7 open". */
  meta?: string;
}

interface SectionNavProps<T extends string> {
  items: readonly SectionNavItem<T>[];
  active: T;
  onChange: (id: T) => void;
}

/** Sub-section menu for settings-style pages: a vertical card on md+, horizontal tabs on mobile. */
export function SectionNav<T extends string>({ items, active, onChange }: SectionNavProps<T>) {
  return (
    <>
      <nav className="scrollbar-hide flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1 md:hidden">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors',
              active === item.id ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900',
            )}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
      </nav>

      <nav className="hidden space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm md:sticky md:top-0 md:block">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors',
                isActive ? 'bg-blue-50' : 'hover:bg-slate-50',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                  isActive ? 'bg-white text-blue-600 ring-1 ring-blue-100' : 'bg-slate-100 text-slate-500 group-hover:text-slate-700',
                )}
              >
                <item.icon size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block truncate text-sm font-semibold', isActive ? 'text-slate-950' : 'text-slate-700')}>
                  {item.label}
                </span>
                {item.description && (
                  <span className="block truncate text-xs text-slate-500">{item.description}</span>
                )}
              </span>
              {item.meta && (
                <span className={cn('shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium', isActive ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-500')}>
                  {item.meta}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default SectionNav;
