import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQItem = ({ question, answer, defaultOpen = false }: { question: string, answer: string, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white-light rounded-xl bg-white overflow-hidden mb-3 hover:border-blue-electric/30 transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white-light/50 transition-colors"
      >
        <span className="font-bold text-charcoal text-[13px]">{question}</span>
        {isOpen ? <Minus size={16} className="text-blue-electric" /> : <Plus size={16} className="text-charcoal-light" />}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-[13px] text-charcoal-light font-medium leading-relaxed border-t border-white-light pt-4">
          {answer}
        </div>
      )}
    </div>
  );
};

export default FAQItem;