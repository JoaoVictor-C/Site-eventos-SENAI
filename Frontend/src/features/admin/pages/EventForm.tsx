import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BatchType, Batch, Event as EventEntity, EventCategory } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/config/routes';

interface Props {
  event?: EventEntity | null;
  onSubmit: (data: EventEntity) => Promise<void>;
}

// Form state interface closely matching the EventEntity
interface EventFormState extends Omit<EventEntity, 'id' | 'organizer' | 'hasAvailableTickets' | 'isOpen' | 'hasStarted' | 'hasEnded' | 'availableTickets'> {
  id?: string;
}

// Initial form state
const initialFormState: EventFormState = {
  name: '',
  description: '',
  imageUrl: '',
  eventDate: '',
  endDate: '',
  location: '',
  isActive: true,
  maxParticipants: 0,
  category: EventCategory.Other,
  batches: [],
  organizerId: '',
  eventRoles: [],
  createdAt: new Date().toISOString(),
  isDeleted: false,
};

// Initial batch state
const initialBatch: Omit<Batch, 'id' | 'eventId'> = {
  name: '',
  unitPrice: 0,
  totalQuantity: 0,
  stock: 0,
  startDate: '',
  endDate: '',
  type: BatchType.Quantity,
  isActive: true,
  createdAt: new Date().toISOString(),
  isDeleted: false,
  hasStarted: false,
  hasEnded: false,
  isAvailable: false,
  hasStock: false,
  isInTimeWindow: false,
  tickets: []
};

const EventForm = ({ event, onSubmit }: Props) => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState<EventFormState>(() => {
    if (!event) return { ...initialFormState };

    // Map batches if present in event (handle $values array from .NET)
    let batches: Batch[] = [];
    if (event.batches && Array.isArray((event.batches as any).$values)) {
      batches = (event.batches as any).$values.map((batch: any) => ({
        ...batch,
        ...initialBatch,
        ...batch,
      }));
    } else if (Array.isArray(event.batches)) {
      batches = event.batches as Batch[];
    }

    return {
      ...initialFormState,
      ...event,
      batches,
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  // Helper function to check if a date is valid

  // Track date restriction for free batches
  const [freeBatchDateRestriction, setFreeBatchDateRestriction] = useState<{ [key: string]: boolean }>({});

  // Event form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setEventData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };  

  const handleBatchChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name: inputName, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setEventData(prev => {
      const batches = [...prev.batches];
      const currentBatch = batches[index];
      if (!currentBatch) return prev;

      // Extract the actual property name from the input name (e.g., "name-0" -> "name")
      const name = inputName.split('-')[0] as keyof Batch;
      
      // Helper function to update computed properties
      const updateComputedProperties = (batch: Batch) => {
        const updatedBatch = { ...batch };
        const totalQuantity = Number(batch.totalQuantity);
        const startDate = batch.startDate ? new Date(batch.startDate) : null;
        const endDate = batch.endDate ? new Date(batch.endDate) : null;
        const now = new Date();

        updatedBatch.hasStock = totalQuantity > 0;
        updatedBatch.hasStarted = startDate ? startDate <= now : false;
        updatedBatch.hasEnded = endDate ? endDate <= now : false;
        updatedBatch.isAvailable = batch.isActive && updatedBatch.hasStock;
        updatedBatch.isInTimeWindow = startDate && endDate ? startDate <= now && endDate >= now : false;

        return updatedBatch;
      };

      let updatedBatch = {
        ...currentBatch,
        [name]: type === 'number' ? Number(value) : checked !== undefined ? checked : value
      };

      // If changing to Free type, set unitPrice to 0 and clear dates
      if (name === 'type' && value === BatchType.Free) {
        updatedBatch.unitPrice = 0;
        updatedBatch.startDate = null;
        updatedBatch.endDate = null;
      }
      // If changing to Quantity type, clear dates
      if (name === 'type' && value === BatchType.Quantity) {
        updatedBatch.startDate = null;
        updatedBatch.endDate = null;
      }

      // Apply computed properties
      updatedBatch = updateComputedProperties(updatedBatch);

      // Update the batches array
      batches[index] = updatedBatch;

      return {
        ...prev,
        batches
      };
    });
  };
  
  const handleAddBatch = () => {
    setEventData(prev => {
      const newBatch = {
        ...initialBatch,
        id: `temp-new-${Date.now()}`,
        eventId: prev.id || '',
        hasStarted: false,
        hasEnded: false,
        isAvailable: true,
        hasStock: true,
        isInTimeWindow: true
      } as Batch;

      return {
        ...prev,
        batches: [...(prev.batches || []), newBatch]
      };
    });
  };

  const handleRemoveBatch = (index: number) => {
    setEventData(prev => {
      if (!prev.batches) return prev;

      const updatedBatches = prev.batches.filter((_, i) => i !== index);
      return {
        ...prev,
        batches: updatedBatches
      };
    });
  };  
  
  const validateForm = () => {
    // Required field validation
    const requiredFields: Array<{ field: keyof EventFormState; label: string }> = [
      { field: 'name', label: 'Nome do Evento' },
      { field: 'description', label: 'Descrição' },
      { field: 'eventDate', label: 'Data de Início' },
      { field: 'endDate', label: 'Data de Término' },
      { field: 'location', label: 'Local' },
      { field: 'maxParticipants', label: 'Número Máximo de Participantes' },
      { field: 'category', label: 'Categoria' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !eventData[field]);
    if (missingFields.length > 0) {
      setError(`Por favor, preencha os seguintes campos: ${missingFields.map(f => f.label).join(', ')}`);
      return false;
    }

    // Date validation
    const startDate = new Date(eventData.eventDate);
    const endDate = new Date(eventData.endDate);
    if (endDate <= startDate) {
      setError('A data de término deve ser posterior à data de início.');
      return false;
    }

    // Batch validation
    if (eventData.batches.length > 0) {
      for (const batch of eventData.batches) {
        // Validate name
        if (!batch.name) {
          setError('Por favor, preencha o nome de todos os lotes.');
          return false;
        }

        // Validate totalQuantity
        if (batch.totalQuantity <= 0) {
          setError('A quantidade de ingressos por lote deve ser maior que zero.');
          return false;
        }

        // Free batch: only validate dates if date restriction is enabled
        if (batch.type === BatchType.Free) {
          const showDateRestriction = freeBatchDateRestriction[batch.id] || false;
          if (showDateRestriction) {
            if (!batch.startDate || !batch.endDate) {
              setError(`Por favor, preencha as datas do lote gratuito "${batch.name}".`);
              return false;
            }
            const batchStart = new Date(batch.startDate);
            const batchEnd = new Date(batch.endDate);
            if (batchEnd <= batchStart) {
              setError(`O lote gratuito "${batch.name}" tem data de término anterior ou igual à data de início.`);
              return false;
            }
            const eventStart = new Date(eventData.eventDate);
            const eventEnd = new Date(eventData.endDate);
            if (batchStart < eventStart || batchEnd > eventEnd) {
              setError(`As datas do lote gratuito "${batch.name}" devem estar dentro do período do evento.`);
              return false;
            }
          }
        } else if (batch.type === BatchType.Quantity) {
          // Quantity batch: do not allow dates
          if (batch.startDate || batch.endDate) {
            setError(`Lotes do tipo quantidade não devem ter datas de início ou término.`);
            return false;
          }
          // Price must be >= 0
          if (batch.unitPrice < 0) {
            setError(`O preço do lote "${batch.name}" não pode ser negativo.`);
            return false;
          }
        } else if (batch.type === BatchType.TimeWindow) {
          // TimeWindow batch: dates required and must be valid
          if (!batch.startDate || !batch.endDate) {
            setError(`Por favor, preencha as datas do lote "${batch.name}".`);
            return false;
          }
          const batchStart = new Date(batch.startDate);
          const batchEnd = new Date(batch.endDate);
          if (batchEnd <= batchStart) {
            setError(`O lote "${batch.name}" tem data de término anterior ou igual à data de início.`);
            return false;
          }
          const eventStart = new Date(eventData.eventDate);
          const eventEnd = new Date(eventData.endDate);
          if (batchStart < eventStart || batchEnd > eventEnd) {
            setError(`As datas do lote "${batch.name}" devem estar dentro do período do evento.`);
            return false;
          }
          // Price must be >= 0
          if (batch.unitPrice < 0) {
            setError(`O preço do lote "${batch.name}" não pode ser negativo.`);
            return false;
          }
        }
      }
    }

    setError(null);
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const eventDataToSubmit = {
        ...eventData,
        batches: eventData.batches?.filter(b => !b.isDeleted).map(b => ({
          ...b,
          startDate: b.startDate + 'Z',
          endDate: b.endDate + 'Z'
        }))
      };

      await onSubmit(eventDataToSubmit as EventEntity);
      navigate(ROUTES.ADMIN.EVENTS.LIST);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Erro ao ${event ? 'atualizar' : 'criar'} evento: ${err.message}`);
      } else {
        setError('Erro desconhecido ao salvar o evento');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Carregando formulário do evento..." />;

  const pageTitle = event ? 'Editar Evento' : 'Criar Novo Evento';

  const getBatchTypeLabel = (type: BatchType) => {
    switch (type) {
      case BatchType.Free:
        return 'Gratuito';
      case BatchType.Quantity:
        return 'Por Quantidade';
      case BatchType.TimeWindow:
        return 'Por Período';
      default:
        return type;
    }
  };

  const handleFreeBatchDateRestrictionChange = (batchId: string, checked: boolean) => {
    setFreeBatchDateRestriction(prev => ({ ...prev, [batchId]: checked }));
  };

  // Helper to format date for datetime-local input
  const formatDateTimeLocal = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    // Pad with zeros
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-senai-gray dark:text-gray-100 mb-6">{pageTitle}</h2>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
        {error && (
          <div className="flex items-center p-4 mb-4 text-sm text-red-800 bg-red-100 dark:bg-red-900 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Event Details Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center">
            Detalhes do Evento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome do Evento *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={eventData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 p-"
                placeholder="Ex: Workshop de Tecnologia"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Local *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={eventData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                placeholder="Ex: Auditório SENAI"
              />
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL da Imagem
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={eventData.imageUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                placeholder="https://exemplo.com/imagem.jpg"
              />
              {eventData.imageUrl && (
                <div className="mt-2 flex items-center">
                  <img
                    src={eventData.imageUrl}
                    alt="Pré-visualização da imagem"
                    className="w-32 h-20 object-cover rounded border border-gray-200 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800"
                    onError={() => setEventData(prev => ({ ...prev, imageUrl: '' }))}
                  />
                  <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">Pré-visualização</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descrição *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={eventData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
              placeholder="Descreva o evento..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data de Início *
              </label>
              <input
                type="datetime-local"
                id="eventDate"
                name="eventDate"
                required
                value={formatDateTimeLocal(eventData.eventDate)}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
              />
              <span className="text-xs text-gray-400">Ex: 2025-06-19T09:00</span>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data de Término *
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                required
                value={formatDateTimeLocal(eventData.endDate)}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
              />
              <span className="text-xs text-gray-400">Ex: 2025-06-19T18:00</span>
            </div>
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Número Máximo de Participantes *
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                required
                min="1"
                value={eventData.maxParticipants}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
                placeholder="Ex: 100"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoria *
              </label>
              <select
                id="category"
                name="category"
                required
                value={eventData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
              >
                {Object.values(EventCategory).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={eventData.isActive}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-senai-red shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Evento Ativo</span>
            </label>
          </div>
        </div>

        {/* Batches Section */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <svg className="w-5 h-5 mr-2 text-senai-red" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M16 3v4M8 3v4" />
              </svg>
              Lotes
            </h3>
            <button
              type="button"
              onClick={handleAddBatch}
              className="px-4 py-2 text-sm font-medium text-white bg-senai-red rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-senai-red flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Adicionar Lote
            </button>
          </div>

          <div className="space-y-6">
            {eventData.batches?.map((batch: Batch, index: number) => {
              const isFree = batch.type === BatchType.Free;
              const showDateRestriction = freeBatchDateRestriction[batch.id] || false;
              return (
                <div key={batch.id} className="relative p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-sm">
                  <button
                    type="button"
                    onClick={() => handleRemoveBatch(index)}
                    className="absolute -top-3 -right-3 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                    title="Remover Lote"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome do Lote *
                      </label>
                      <input
                        type="text"
                        name={`name-${index}`}
                        value={batch.name}
                        onChange={(e) => handleBatchChange(index, e)}
                        placeholder="Nome do Lote"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo de Lote *
                      </label>
                      <select
                        name={`type-${index}`}
                        value={batch.type}
                        onChange={(e) => handleBatchChange(index, e)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5"
                      >
                        {Object.values(BatchType).map(type => (
                          <option key={type} value={type}>
                            {getBatchTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Free batch: quantity always, date restriction optional */}
                  {isFree && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`dateRestriction-${batch.id}`}
                          checked={showDateRestriction}
                          onChange={e => handleFreeBatchDateRestrictionChange(batch.id, e.target.checked)}
                          className="rounded border-gray-300 text-senai-red shadow-sm focus:border-senai-red focus:ring-senai-red mr-2"
                        />
                        <label htmlFor={`dateRestriction-${batch.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                          Restringir por data
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quantidade de Ingressos *
                          </label>
                          <input
                            type="number"
                            name={`totalQuantity-${index}`}
                            value={batch.totalQuantity}
                            onChange={e => handleBatchChange(index, e)}
                            placeholder="Quantidade"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5"
                            min="1"
                          />
                        </div>
                        {showDateRestriction && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data de Início
                              </label>
                              <input
                                type="datetime-local"
                                name={`startDate-${index}`}
                                value={formatDateTimeLocal(batch.startDate)}
                                onChange={e => handleBatchChange(index, e)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data de Término
                              </label>
                              <input
                                type="datetime-local"
                                name={`endDate-${index}`}
                                value={formatDateTimeLocal(batch.endDate)}
                                onChange={e => handleBatchChange(index, e)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {batch.type !== BatchType.Free && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Preço Unitário *
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
                            R$
                          </span>
                          <input
                            type="number"
                            name={`unitPrice-${index}`}
                            value={batch.unitPrice}
                            onChange={(e) => handleBatchChange(index, e)}
                            placeholder="0,00"
                            className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Quantidade Total *
                        </label>
                        <input
                          type="number"
                          name={`totalQuantity-${index}`}
                          value={batch.totalQuantity}
                          onChange={(e) => handleBatchChange(index, e)}
                          placeholder="Quantidade"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5"
                          min="1"
                        />
                      </div>
                    </div>
                  )}

                  {batch.type === BatchType.TimeWindow && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Data de Início *
                        </label>
                        <input
                          type="datetime-local"
                          name={`startDate-${index}`}
                          value={formatDateTimeLocal(batch.startDate)}
                          onChange={(e) => handleBatchChange(index, e)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Data de Término *
                        </label>
                        <input
                          type="datetime-local"
                          name={`endDate-${index}`}
                          value={formatDateTimeLocal(batch.endDate)}
                          onChange={(e) => handleBatchChange(index, e)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2.5"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name={`isActive-${index}`}
                        checked={batch.isActive}
                        onChange={(e) => handleBatchChange(index, e)}
                        className="rounded border-gray-300 text-senai-red shadow-sm focus:border-senai-red focus:ring-senai-red sm:text-sm"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Lote Ativo</span>
                    </label>
                    {batch.type === BatchType.Quantity && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Estoque Disponível: {batch.stock}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN.EVENTS.LIST)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-senai-red dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-senai-red border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-senai-red disabled:opacity-50 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
