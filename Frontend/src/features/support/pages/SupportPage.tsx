import React, { useState } from 'react';
import { FAQAccordion } from '../components/FAQAccordion';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorFallback } from '@/components/ui/ErrorFallback';
import { constants } from '../constants';

// Example FAQs (frontend only)
const exampleFaqs = [
  {
    id: '1',
    question: 'Como faço para comprar um ingresso?',
    answer: 'Acesse a página do evento desejado e clique no botão "Comprar ingresso". Siga as instruções para completar sua compra.',
  },
  {
    id: '2',
    question: 'Posso cancelar minha inscrição?',
    answer: 'Após confirmado o ingresso, não é possível cancelar a inscrição. Em caso de problemas, entre em contato com o suporte.',
  },
  {
    id: '3',
    question: 'Como recebo meu ingresso?',
    answer: 'Após a confirmação do pagamento, seu ingresso estará disponível na página meus ingressos.',
  },
  {
    id: '4',
    question: 'O que fazer se eu esquecer minha senha?',
    answer: 'Clique em "Esqueci minha senha" na tela de login e siga as instruções para redefinir sua senha.',
  }
];

export default function SupportPage() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Remove useQuery and use local exampleFaqs
  const faqs = exampleFaqs;
  const isLoading = false;
  const error = null;

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner message="Carregando..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorFallback
        error={error as Error}
        resetErrorBoundary={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Text as="h1" variant="large" className="text-senai-red mb-8 text-center">
        {constants.ui.TEXT_SUPPORT}
      </Text>

      <Card className="mb-12">
        <div className="p-6">
          <Text as="h2" variant="large" className="text-senai-gray dark:text-gray-100 mb-4">
            {constants.ui.TEXT_SENAI_INFO_TITLE}
          </Text>
          <Text variant="default" className="leading-relaxed mb-4">
            {constants.ui.TEXT_SENAI_INFO_CONTENT}
          </Text>
          <Text variant="default" className="mt-4">
            Para dúvidas, sugestões ou problemas, entre em contato conosco através do e-mail:{' '}
            <a href="mailto:suporte.eventos@senai.br" className="text-senai-red hover:underline dark:text-red-400 dark:hover:text-red-300">
              suporte.eventos@senai.br
            </a>{' '}
            ou pelo telefone (XX) XXXX-XXXX.
          </Text>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <Text as="h2" variant="large" className="text-senai-gray dark:text-gray-100 mb-6">
            {constants.ui.TEXT_FAQ_TITLE}
          </Text>
          <FAQAccordion
            faqs={faqs || []}
            openFaqId={openFaqId}
            onToggleFaq={toggleFaq}
          />
        </div>
      </Card>
    </div>
  );
};
