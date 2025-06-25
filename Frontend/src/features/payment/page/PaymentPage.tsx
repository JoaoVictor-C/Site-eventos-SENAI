import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AggregatedPaymentReservation, PaymentReservationItem, TicketType } from '../types';
import { paymentService } from '../api/paymentService';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { TEXT_CONFIRM_RESERVATION, TEXT_RESERVATION_NOTICE } from '@/constants';
import { ROUTES } from '@/config/routes';

interface LocationState {
  reservation: AggregatedPaymentReservation;
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const state = location.state as LocationState | null;

  if (!state || !state.reservation || !state.reservation.items || state.reservation.items.length === 0) {
    React.useEffect(() => {
      navigate(ROUTES.HOME);
    }, [navigate]);
    return <div className="text-center p-10 dark:text-gray-300">Detalhes da reserva não encontrados ou inválidos. Redirecionando...</div>;
  }

  const { eventId, eventName, items } = state.reservation;
  const totalPrice = items.reduce((sum, item) => sum + ((item.unitPrice ?? 0) * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirmReservation = async () => {
    if (!currentUser) {
      setModalTitle("Erro na Reserva");
      setModalMessage("Você precisa estar logado para confirmar a reserva.");
      setIsModalOpen(true);
      return;
    }
    setIsLoading(true);
    try {
      // Call backend integration
      await paymentService.reserveTickets(items.map(item => ({
        batchId: item.batchId,
        quantity: item.quantity,
        type: TicketType.Other, // Use enum value
        acceptTerms: true, // Assuming terms are accepted by default
        // price: item.unitPrice, // Optional, can be used for logging
      })));
      setModalTitle("Reserva Confirmada!");
      setModalMessage(`Reserva para ${totalQuantity} ingresso(s) do evento "${eventName}" confirmada com sucesso! Valor total: R$ ${totalPrice.toFixed(2)}. ${TEXT_RESERVATION_NOTICE}`);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Reservation failed:", error);
      setModalTitle("Falha na Reserva");
      setModalMessage(`Falha ao confirmar reserva. Tente novamente. Erro: ${(error as Error).message}`);
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const closeModalAndNavigate = () => {
    setIsModalOpen(false);
    if (modalTitle === "Reserva Confirmada!") {
      navigate(ROUTES.TICKETS.LIST);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-senai-red mb-6 text-center">Confirmar Reserva</h1>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-senai-gray dark:text-gray-100 mb-3">{eventName}</h2>
          {items.map(item => (
            <div key={item.batchId} className="mb-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <p className="text-gray-700 dark:text-gray-300">Lote: <span className="font-medium">{item.batchName}</span></p>
              <p className="text-gray-700 dark:text-gray-300">Quantidade: <span className="font-medium">{item.quantity}</span></p>
              <p className="text-gray-700 dark:text-gray-300">Preço Unitário: <span className="font-medium">R$ {(item.unitPrice ?? 0).toFixed(2)}</span></p>
              <p className="text-md font-semibold text-senai-gray dark:text-gray-200">Subtotal: R$ {((item.unitPrice ?? 0) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <p className="text-xl font-bold text-senai-red mt-4">Total da Reserva: R$ {totalPrice.toFixed(2)}</p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-700 dark:bg-opacity-20 border-l-4 border-senai-yellow text-yellow-700 dark:text-yellow-300 p-4 rounded-md mb-6" role="alert">
          <p className="font-bold">Atenção!</p>
          <p>{TEXT_RESERVATION_NOTICE}</p>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Processando reserva..." />
        ) : (
          <button
            onClick={handleConfirmReservation}
            className="w-full bg-senai-red text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-red-700 dark:hover:bg-red-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            disabled={totalQuantity === 0}
          >
            {TEXT_CONFIRM_RESERVATION}
          </button>
        )}
        <div className="mt-6 text-center">
            <Link to={ROUTES.HOME} className="text-sm text-senai-red hover:underline dark:text-red-400 dark:hover:text-red-300">
                Cancelar e voltar para Início
            </Link>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModalAndNavigate} 
        title={modalTitle}
      >
        <p className="text-gray-700 dark:text-gray-300">{modalMessage}</p>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={closeModalAndNavigate}
            className="bg-senai-red text-white py-2 px-4 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            {modalTitle === "Reserva Confirmada!" ? "Ver Meus Ingressos" : "Fechar"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentPage;