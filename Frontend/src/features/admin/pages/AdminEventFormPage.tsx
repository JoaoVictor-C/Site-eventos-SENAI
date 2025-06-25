import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { adminCreateEvent, adminUpdateEvent } from '../api/adminService';
import EventForm from './EventForm';
import {  Event } from '@/types';
import { useEventDetail } from '@/queries/events.queries';
import { ROUTES } from '@/config/routes';

// Define routes object if not available globally


export default function AdminEventFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { data: event, isLoading: isEventLoading, error: eventError } = useEventDetail(id, { enabled: isEdit });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (eventError) {
      setError(`Failed to load event: ${eventError instanceof Error ? eventError.message : 'Unknown error'}`);
    }
  }, [eventError]);

  useEffect(() => {
    if (isEventLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [isEventLoading]);

  const handleSubmit = async (formData: Event) => {
    try {
      setIsLoading(true);
      setError(null);
      // Normalize event.batches to always be an array
      let eventBatches: any[] = [];
      if (event?.batches) {
        if (Array.isArray((event.batches as any).$values)) {
          eventBatches = (event.batches as any).$values;
        } else if (Array.isArray(event.batches)) {
          eventBatches = event.batches;
        }
      }

      const eventData = {
        ...formData,
        batches: formData.batches.map(batch => {
          const existingBatch = eventBatches.find(b => b.id === batch.id);
          const now = new Date();
          const startDate = batch.startDate ? new Date(batch.startDate) : null;
          const endDate = batch.endDate ? new Date(batch.endDate) : null;

          return {
            ...batch,
            id: existingBatch?.id || '00000000-0000-0000-0000-000000000000',
            eventId: id || '',
            stock: batch.totalQuantity,
            tickets: existingBatch?.tickets || [],
            createdAt: existingBatch?.createdAt || new Date().toISOString(),
            hasStarted: startDate ? startDate <= now : false,
            hasEnded: endDate ? endDate <= now : false,
            isAvailable: batch.isActive && batch.totalQuantity > 0,
            hasStock: batch.totalQuantity > 0,
            isInTimeWindow: startDate && endDate ? startDate <= now && endDate >= now : false
          };
        })
      };
      setIsLoading(false);

      if (isEdit && id) {
        await adminUpdateEvent(id, eventData);
      } else {
        await adminCreateEvent(eventData);
      }
      navigate(ROUTES.ADMIN.EVENTS.LIST);
    } catch (error) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Failed to save event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
        <LoadingSpinner message={`${isEdit ? 'Loading' : 'Creating'} event...`} />
        <span className="mt-4 text-gray-500 dark:text-gray-300">Aguarde, processando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200 shadow">
        <svg className="w-8 h-8 mb-2 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
        <span>{error}</span>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-senai-red text-white rounded hover:bg-red-700">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-3x2 mx-auto py-10 px-4 md:px-0">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Editar Evento' : 'Criar Novo Evento'}
        </h1>
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
        {event !== undefined && (
          <EventForm
            event={event}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
