import type React from 'react';

interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  onClick: () => void;
}

const OptionCard: React.FC<OptionCardProps> = ({ icon: Icon, title, description, time, onClick }) => (
  <button 
    onClick={onClick}
    className="flex-1 text-left p-6 border-2 border-white-light rounded-2xl hover:border-blue-electric hover:bg-blue-electric/10 transition-all group"
  >
    <div className="w-12 h-12 bg-white border border-white-light rounded-full flex items-center justify-center mb-4 text-charcoal-medium group-hover:text-blue-electric group-hover:border-blue-electric/30">
      <Icon size={24} />
    </div>
    <h3 className="font-bold text-lg text-charcoal mb-1">{title}</h3>
    <p className="text-sm text-charcoal-light mb-3">{description}</p>
    <span className="text-xs font-medium bg-white-light text-charcoal-medium px-2 py-1 rounded group-hover:bg-blue-electric/20 group-hover:text-blue-electric">
      {time}
    </span>
  </button>
);

export default OptionCard;
