import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Text } from '@/components/ui/Text';
import { ROUTES } from '@/config/routes';
import { formatDate } from '@/utils';
import { slugify } from '@/utils/slugify';
import { useAuth } from '@/providers/AuthProvider';
import type { PaymentReservationItem } from '@/features/shared/types';
import { TicketType } from '@/features/payment/types';
import {
  TEXT_TICKET_PRICE,
  TEXT_AVAILABLE_STOCK,
  TEXT_RESERVE_TICKET,
  TEXT_SELECT_TICKETS,
  TEXT_TICKET_QUANTITY
} from '../../../constants/constants';
import { useEventDetail, useEvents } from '@/queries/events.queries';
import { getFullUuid } from '@/utils/idMapping';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const [ticketSelections, setTicketSelections] = useState<Record<string, number>>({});
  const shortId = id?.split('-')[0];
  const fullId = getFullUuid(shortId);
  console.log(id, shortId, fullId);
  const { data: event, isLoading, error } = useEventDetail(fullId);

  useEffect(() => {
    if (event) {
      const canonicalUrl = ROUTES.EVENTS.DETAIL(event.id, slugify(event.name));
      const currentUrl = ROUTES.EVENTS.DETAIL(shortId);
      if (currentUrl !== canonicalUrl) {
        navigate(canonicalUrl, { replace: true });
      }
    }
  }, [event, shortId, navigate]);

  const handleQuantityChange = (batchId: string, currentStock: number, newQuantityStr: string) => {
    let newQuantity = parseInt(newQuantityStr, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      newQuantity = 0;
    }
    const maxAllowed = Math.min(currentStock, 10);
    newQuantity = Math.min(newQuantity, maxAllowed);

    setTicketSelections(prev => ({
      ...prev,
      [batchId]: newQuantity,
    }));
  };

  const getTotalSelectedPrice = () => {
    if (!event) return 0;
    return Object.entries(ticketSelections).reduce((total, [batchId, qty]) => {
      const batch = event.batches.find(b => b.id === batchId);
      return total + (batch ? batch.unitPrice * qty : 0);
    }, 0);
  };

  const totalSelectedQuantity = Object.values(ticketSelections).reduce((sum, qty) => sum + qty, 0);

  const handleReserveClick = () => {
    if (!event || !currentUser) {
      if (!currentUser) {
        navigate(ROUTES.AUTH.LOGIN, {
          state: { from: location.pathname },
        });
      }
      return;
    }

    // Map selected batches to include correct properties for PaymentPage
    const selectedBatches: PaymentReservationItem[] = event.batches
      .filter(batch => (ticketSelections[batch.id] || 0) > 0)
      .map(batch => ({
        batchId: batch.id,
        batchName: batch.name,
        unitPrice: batch.unitPrice,
        price: batch.unitPrice, // for compatibility
        quantity: ticketSelections[batch.id] || 0,
        type: TicketType.Regular, // Use default TicketType
        acceptTerms: true // or get from UI if needed
      }));
    if (selectedBatches.length === 0) return;
    console.log("Selected batches for reservation:", selectedBatches);

    navigate(ROUTES.ORDERS.PAYMENT, {
      state: {
        reservation: {
          eventId: event.id,
          eventName: event.name,
          items: selectedBatches,
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-10">
        <Text variant="heading2" className="mb-4">Evento não encontrado.</Text>
        <Link to={ROUTES.HOME} className="text-red-600 hover:underline">Voltar para Home</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <img
          src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/400`}
          alt={event.name}
          className="w-full h-64 md:h-96 object-cover"
        />
        <div className="p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-senai-red mb-4">{event.name}</h1>
          <div className="text-gray-600 dark:text-gray-400 mb-6 space-y-1">
            <p className="text-lg">📅 <span className="font-medium">{formatDate(event.eventDate)}</span></p>
            <p className="text-lg">📍 <span className="font-medium">{event.location}</span></p>
          </div>

          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-8">
            <h2 className="text-2xl font-semibold text-senai-gray dark:text-gray-100 mb-3">Sobre o Evento</h2>
            <p>{event.description}</p>
          </div>

          {event.batches && event.batches.length > 0 && (
            <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
              <h2 className="text-2xl font-semibold text-senai-gray dark:text-gray-100 mb-4">{TEXT_SELECT_TICKETS}</h2>
              <div className="space-y-4">
                {event.batches
                  .filter(batch => batch.isActive) // Only show active batches
                  .map((batch) => (
                    <div
                      key={batch.id}
                      className={`p-4 border rounded-lg transition-all ${batch.stock === 0 ? 'bg-gray-200 dark:bg-gray-600 opacity-60 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'} border-gray-300 dark:border-gray-600`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                        <div className="mb-2 sm:mb-0">
                          <h3 className={`text-lg font-semibold ${batch.stock === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-senai-red'}`}>{batch.name}</h3>
                          <p className={`${batch.stock === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{TEXT_TICKET_PRICE}: <span className="font-bold">R$ {batch.unitPrice.toFixed(2)}</span></p>
                          <p className={`${batch.stock === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'} text-sm`}>{TEXT_AVAILABLE_STOCK}: {batch.stock}</p>
                          <p className={`text-sm ${batch.stock === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>Tipo: {batch.type}</p>
                        </div>
                        {batch.stock > 0 && (
                          <div className="sm:w-1/4">
                            <label htmlFor={`quantity-${batch.id}`} className="sr-only">{TEXT_TICKET_QUANTITY} para {batch.name}</label>
                            <input
                              type="number"
                              id={`quantity-${batch.id}`}
                              name={`quantity-${batch.id}`}
                              min="0"
                              max={Math.min(batch.stock, 10)} // Max 10 or stock
                              value={ticketSelections[batch.id] || 0}
                              onChange={(e) => handleQuantityChange(batch.id, batch.stock, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-senai-red focus:border-senai-red bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                            />
                          </div>
                        )}
                      </div>
                      {batch.stock === 0 && <span className="mt-2 inline-block text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 dark:bg-opacity-30 px-2 py-1 rounded-full">Esgotado</span>}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {currentUser && totalSelectedQuantity > 0 && (
            <button
              onClick={handleReserveClick}
              className="w-full bg-senai-red text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors shadow-md"
            >
              {TEXT_RESERVE_TICKET} ({totalSelectedQuantity} {totalSelectedQuantity === 1 ? "ingresso" : "ingressos"} - R$ {getTotalSelectedPrice().toFixed(2)})
            </button>
          )}

          {!currentUser && (
            <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-700 dark:bg-opacity-30 text-yellow-700 dark:text-yellow-300 rounded-md text-center">
              <p>Você precisa estar <Link to={`/login?redirect=${location.pathname}`} className="font-bold underline hover:text-yellow-800 dark:hover:text-yellow-200">logado</Link> para reservar ingressos.</p>
            </div>
          )}

          {currentUser && event.batches && event.batches.every(b => b.stock === 0) && (
            <div className="mt-6 p-4 bg-orange-100 dark:bg-orange-700 dark:bg-opacity-30 text-orange-700 dark:text-orange-300 rounded-md text-center">
              <p className="font-semibold">Ingressos Esgotados!</p>
              <p>Todos os lotes para este evento estão esgotados no momento.</p>
            </div>
          )}
          {currentUser && totalSelectedQuantity === 0 && event.batches.some(b => b.stock > 0) && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-700 dark:bg-opacity-20 text-blue-700 dark:text-blue-300 rounded-md text-center">
              <p>Selecione a quantidade desejada para um ou mais lotes de ingresso.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
