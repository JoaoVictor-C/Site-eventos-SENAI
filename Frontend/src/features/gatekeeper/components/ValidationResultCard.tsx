import React from 'react';
import { TicketValidationResult } from '../types';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';

interface ValidationResultCardProps {
  result: TicketValidationResult;
}

const StatusDisplay: Record<TicketValidationResult['status'], { icon: string; bg: string; text: string }> = {
  valid: {
    icon: '✅',
    bg: 'bg-green-100 dark:bg-green-800',
    text: 'Ingresso Válido',
  },
  used: {
    icon: '⚠️',
    bg: 'bg-yellow-100 dark:bg-yellow-800',
    text: 'Ingresso Já Utilizado',
  },
  invalid: {
    icon: '❌',
    bg: 'bg-red-100 dark:bg-red-800',
    text: 'Ingresso Inválido',
  },
};

export const ValidationResultCard: React.FC<ValidationResultCardProps> = ({ result }) => {
  const status = StatusDisplay[result.status];

  return (
    <Card className={`mt-6 ${status.bg}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Text variant="large" className="font-bold flex items-center gap-2">
            <span>{status.icon}</span>
            {status.text}
          </Text>
          <Text variant="muted">ID: {result.ticket_id}</Text>
        </div>
        
        <div className="space-y-2">
          <div>
            <Text variant="small" className="font-medium">Evento:</Text>
            <Text variant="default">{result.event_name}</Text>
          </div>
          
          <div>
            <Text variant="small" className="font-medium">Usuário:</Text>
            <Text variant="default">{result.user_name}</Text>
          </div>
          
          {result.used_at && (
            <div>
              <Text variant="small" className="font-medium">Utilizado em:</Text>
              <Text variant="default">{new Date(result.used_at).toLocaleString()}</Text>
            </div>
          )}
          
          {result.message && (
            <Text variant="muted" className="mt-4 italic">
              {result.message}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
};
