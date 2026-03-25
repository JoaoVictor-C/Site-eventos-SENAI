import { Link } from 'react-router-dom';
import { useAuth } from '@/providers';
import { TicketCard } from '../components/TicketCard';
import { Ticket } from '@/types';
import { Button } from '../../../components/ui/Button';
import { Text } from '../../../components/ui/Text';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { ROUTES } from '@/config/routes';
import {
  TEXT_MY_TICKETS,
  TEXT_NO_TICKETS_FOUND,
  TEXT_LOADING_TICKETS,
  TEXT_LOGIN_REQUIRED,
  ERROR_LOADING_TICKETS
} from '../constants';
import { useMyTickets } from '@/queries/tickets.queries';
import { useEventDetail } from '@/queries/events.queries';

export default function MyTicketsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: tickets, isLoading, error } = useMyTickets();

  // Only call useEventDetail if tickets are loaded and not empty
  const eventId = tickets && tickets.length > 0 ? tickets[0]?.batch?.eventId : undefined;
  const {
    data: event,
    isLoading: isEventLoading,
    error: eventError
  } = useEventDetail(eventId!, { enabled: !!eventId });


  if (authLoading || isLoading || isEventLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner message={TEXT_LOADING_TICKETS} />
      </div>
    );
  }

  if (error || eventError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorAlert
          title={ERROR_LOADING_TICKETS}
          message={error?.message || eventError?.message}
          action={<Button onClick={() => window.location.reload()}>Tentar Novamente</Button>}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <Text variant="lead" className="text-2xl text-senai-red mb-4 font-semibold">
          {TEXT_LOGIN_REQUIRED}
        </Text>
        <Link to={ROUTES.AUTH.LOGIN}>
          <Button variant="primary">Fazer Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Text variant="lead" className="text-3xl text-senai-red mb-8 text-center font-bold">
        {TEXT_MY_TICKETS}
      </Text>

      {tickets.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2H5z"
            />
          </svg>
          <Text variant="lead" className="text-gray-600 dark:text-gray-400">
            {TEXT_NO_TICKETS_FOUND}
          </Text>
          <Link to={ROUTES.HOME}>
            <Button variant="primary" className="mt-4">
              Ver Eventos
            </Button>
          </Link>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {tickets.map((ticket: Ticket) => (
            <TicketCard ticket={ticket} event={event} key={ticket.id} />
          ))}
        </div>
      )}
    </div>
  )
}
