import React from 'react';
import { FAQItem } from '../types';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';

interface FAQAccordionProps {
  faqs: FAQItem[];
  openFaqId: string | null;
  onToggleFaq: (id: string) => void;
}

const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>;
const ChevronUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>;

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ faqs, openFaqId, onToggleFaq }) => {
  if (!faqs.length) {
    return (
      <Text variant="muted" className="text-gray-600 dark:text-gray-400">
        Nenhuma pergunta frequente disponível no momento.
      </Text>
    );
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <Card key={faq.id} className="overflow-hidden">
          <button
            onClick={() => onToggleFaq(faq.id)}
            className="w-full flex justify-between items-center p-4 text-left text-lg font-medium text-senai-gray dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
            aria-expanded={openFaqId === faq.id}
          >
            <span>{faq.question}</span>
            {openFaqId === faq.id ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
          {openFaqId === faq.id && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50">
              <Text variant="default" className="leading-relaxed">
                {faq.answer}
              </Text>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
