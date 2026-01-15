import { Sparkles, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Card, CardContent } from '../../../../components/ui/Card';

export const AISummary = () => {
  return (
    <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
      <CardContent className="p-6 sm:p-8">
        <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none transform group-hover:scale-110 duration-700">
          <Sparkles className="w-32 h-32 sm:w-48 sm:h-48 text-indigo-600" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-500/10 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                AI Review Summary 
              </h2>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold uppercase tracking-widest text-[10px]">
                Beta
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl border-slate-200 font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-10 px-4">
            <RefreshCw className="w-4 h-4 mr-2" strokeWidth={2.5} /> 
            Regenerate
          </Button>
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
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 mt-2.5 bg-emerald-500 rounded-full flex-shrink-0 shadow-sm shadow-emerald-200"></div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  Customers consistently praise the <strong className="text-slate-900 font-bold">friendly and attentive staff</strong>, specifically mentioning "Sarah" in 3 recent reviews.
                </p>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 mt-2.5 bg-emerald-500 rounded-full flex-shrink-0 shadow-sm shadow-emerald-200"></div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  The <strong className="text-slate-900 font-bold">new seasonal menu</strong> is receiving positive feedback for variety and taste.
                </p>
              </li>
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
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 mt-2.5 bg-slate-300 rounded-full flex-shrink-0"></div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                  No areas for improvement identified yet.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
