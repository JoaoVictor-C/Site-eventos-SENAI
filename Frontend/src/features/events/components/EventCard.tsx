import { Link } from 'react-router-dom';
import { Event } from '@/types';
import { formatDate } from '../../../utils/helpers';
import { slugify } from '../../../utils/slugify';
import { ROUTES } from '@/config/routes';
import { CalendarIcon, LocationIcon } from '@/components/ui/icons';

interface EventCardProps {
  event: Event & {
    featured?: boolean;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <Link to={ROUTES.EVENTS.DETAIL(event.id, slugify(event.name))}>
        <div className="relative overflow-hidden aspect-video">
          <img 
            src={event.imageUrl || `https://picsum.photos/seed/${event.id}/400/200`} 
            alt={event.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
          />
          {event.featured && (
            <div className="absolute top-2 right-2">
              <span className="bg-senai-red text-white text-xs px-2 py-1 rounded-full">
                Destaque
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-senai-red mb-2">{event.name}</h3>
          <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>{formatDate(event.eventDate)}</span>
            </div>
            <div className="flex items-center">
              <LocationIcon className="w-4 h-4 mr-2" />
              <span>{event.location}</span>
            </div>
          </div>
          {event.description && (
            <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </Link>
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <Link 
          to={ROUTES.EVENTS.DETAIL(event.id, slugify(event.name))}
          className="block w-full text-center bg-senai-red text-white py-2 px-4 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}