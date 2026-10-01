import React from 'react';
import { ArrowUpRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../../components/ui/Button';

const UpsellCard: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-950">Need more minutes?</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Upgrade for higher minute limits and premium features, or add a one-time minute pack.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Button asChild>
          <Link to="/dashboard/billing/plans" className="no-underline">
            Upgrade plan <ArrowUpRight size={15} />
          </Link>
        </Button>
        <Button variant="outline">
          <ShoppingCart size={15} /> Buy extra minutes
        </Button>
      </div>
    </div>
  );
};

export default UpsellCard;
