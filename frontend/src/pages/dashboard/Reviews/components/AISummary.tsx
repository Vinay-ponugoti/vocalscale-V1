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
      <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden h-64 animate-pulse">
        <CardContent className="p-6">
          <div className="h-8 bg-slate-100 rounded-lg w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-slate-50 rounded-xl"></div>
            <div className="h-32 bg-slate-50 rounded-xl"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-500/10 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                AI Review Summary
              </h2>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 relative z-10">
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-5 flex items-center gap-3 uppercase tracking-widest">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" strokeWidth={3} />
              </div>
              Positives
            </h3>
            <ul className="space-y-4">
              {(summary?.positives || []).length > 0 ? summary?.positives.map((text, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 mt-2.5 bg-emerald-500 rounded-full flex-shrink-0 shadow-sm shadow-emerald-200"></div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {text}
                  </p>
                </li>
              )) : (
                <li className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 mt-2.5 bg-slate-300 rounded-full flex-shrink-0"></div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                    No positive insights identified yet.
                  </p>
                </li>
              )}
            </ul>
          </div>
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-5 flex items-center gap-3 uppercase tracking-widest">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-600" strokeWidth={3} />
              </div>
              Areas for Improvement
            </h3>
            <ul className="space-y-4">
              {(summary?.improvements || []).length > 0 ? summary?.improvements.map((text, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 mt-2.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {text}
                  </p>
                </li>
              )) : (
                <li className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 mt-2.5 bg-slate-300 rounded-full flex-shrink-0"></div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
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
