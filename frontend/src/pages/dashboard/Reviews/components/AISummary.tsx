import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/Card';
import type { AISummaryData } from '../../../../types/review';

interface AISummaryProps {
  summary?: AISummaryData;
  loading?: boolean;
}

export const AISummary = ({ summary, loading }: AISummaryProps) => {
  if (loading) {
    return (
      <Card className="relative h-64 overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm animate-pulse">
        <CardContent className="p-6">
          <div className="mb-6 h-8 w-1/4 rounded-lg bg-slate-100"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 rounded-lg bg-slate-50"></div>
            <div className="h-32 rounded-lg bg-slate-50"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="relative z-10 mb-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black tracking-tight text-slate-950">
                AI Review Summary
              </h2>
            </div>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="mb-5 flex items-center gap-3 text-sm font-black uppercase tracking-wider text-slate-950">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100">
                <TrendingUp className="h-4 w-4 text-emerald-600" strokeWidth={3} />
              </div>
              Positives
            </h3>
            <ul className="space-y-4">
              {(summary?.positives || []).length > 0 ? summary?.positives.map((text, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                  <p className="text-sm font-medium leading-relaxed text-slate-600">
                    {text}
                  </p>
                </li>
              )) : (
                <li className="flex items-start gap-4">
                  <div className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300"></div>
                  <p className="text-sm font-medium italic leading-relaxed text-slate-400">
                    No positive insights identified yet.
                  </p>
                </li>
              )}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="mb-5 flex items-center gap-3 text-sm font-black uppercase tracking-wider text-slate-950">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" strokeWidth={3} />
              </div>
              Areas for Improvement
            </h3>
            <ul className="space-y-4">
              {(summary?.improvements || []).length > 0 ? summary?.improvements.map((text, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500"></div>
                  <p className="text-sm font-medium leading-relaxed text-slate-600">
                    {text}
                  </p>
                </li>
              )) : (
                <li className="flex items-start gap-4">
                  <div className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300"></div>
                  <p className="text-sm font-medium italic leading-relaxed text-slate-400">
                    No areas for improvement identified yet.
                  </p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
