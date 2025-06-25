import { useState } from 'react';
import { Event, TicketStatus } from '@/types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Dialog } from '../../../components/ui/Dialog';
import { QRCode } from '../../../components/ui/QRCode';
import { Text } from '../../../components/ui/Text';
import { cn } from '@/lib/utils';
import { Ticket } from '@/types';

import {
  TEXT_REVEAL_QR_CODE,
  TEXT_TICKET_PRICE
} from '../constants';

interface TicketCardProps {
  ticket: Ticket;
  event?: Event;
}

export function TicketCard({ ticket, event }: TicketCardProps) {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  if (!event) {
    event = ticket.order.event;
  }

  const handleTicketClick = () => {
    setIsQrModalOpen(true);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      [TicketStatus.PAID]: {
        textColor: 'text-green-800 dark:text-green-200',
        bgColor: 'bg-green-200 dark:bg-green-700 dark:bg-opacity-50'
      },
      [TicketStatus.PENDING]: {
        textColor: 'text-yellow-800 dark:text-yellow-200',
        bgColor: 'bg-yellow-200 dark:bg-yellow-700 dark:bg-opacity-50'
      },
      [TicketStatus.USED]: {
        textColor: 'text-blue-800 dark:text-blue-200',
        bgColor: 'bg-blue-200 dark:bg-blue-700 dark:bg-opacity-50'
      },
      [TicketStatus.EXPIRED]: {
        textColor: 'text-gray-800 dark:text-gray-300',
        bgColor: 'bg-gray-300 dark:bg-gray-700'
      },
      [TicketStatus.CANCELED]: {
        textColor: 'text-red-800 dark:text-red-200',
        bgColor: 'bg-red-200 dark:bg-red-700 dark:bg-opacity-50'
      }
    };
    const { textColor, bgColor } = statusConfig[ticket.status as TicketStatus as keyof typeof statusConfig];
    const statusText = ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1);
    return (
      <span className={cn(
        'px-2 py-1 text-xs font-semibold rounded-full',
        textColor,
        bgColor
      )}>
        {statusText}
      </span>
    );
  };

  return (
    <>
      <Card className="mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center mb-2">
            <Text variant="lead" className="text-senai-red">
              {event.name || ticket.order.event.name}
            </Text>
            {getStatusBadge()}
          </div>
          <Text variant="muted">
            Lote: {ticket.batch.name} | Tipo: {ticket.batch.type}
          </Text>
          <Text variant="muted">
            {TEXT_TICKET_PRICE}: R$ {ticket.price.toFixed(2)}
          </Text>
          <Button
            onClick={handleTicketClick}
            variant="primary"
            className="w-full mt-2"
            aria-label={`Revelar QR Code para ${event.name || ticket.order.event.name}`}
          >
            {TEXT_REVEAL_QR_CODE}
          </Button>
        </div>
      </Card>
      <Dialog
        open={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title={`QR Code - ${event.name || ticket.order.event.name}`}
      >
        <div className="text-center">
          <QRCode value={ticket.qrCode} size={300} className="mx-auto" />
          <Text variant="small" className="mt-4 text-gray-600 dark:text-gray-400">
            Este é seu QR Code para entrada no evento. Mantenha-o seguro!
          </Text>
        </div>
      </Dialog>
    </>
  );
}
