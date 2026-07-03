import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <Helmet>
        <title>Page Not Found | VocalScale</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">404 Error</p>
      <h1 className="text-4xl md:text-6xl font-black tracking-[-0.03em] text-slate-900 mb-6 leading-[1.1]">
        Page not found
      </h1>
      <p className="text-lg text-slate-600 font-medium max-w-md mb-10 leading-relaxed">
        The page you're looking for doesn't exist or has moved. Head back to the homepage to explore VocalScale's 24/7 AI receptionist.
      </p>
      <Button
        asChild
        size="lg"
        className="rounded-xl px-8 h-12 text-base font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
      >
        <Link to="/" className="flex items-center gap-2 hover:no-underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
