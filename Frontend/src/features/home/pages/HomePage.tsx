import { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EventCard } from '@/components/ui/EventCard';
import { Event } from '@/types/entities';
import { Text } from '@/components/ui/Text';
import { useEvents } from '@/queries/events.queries';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useEvents();

  const events: Event[] = Array.isArray(data) ? data : [];
  const filteredEvents = events.filter((event: Event) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"
      >
        <div className="text-center text-gray-600 dark:text-gray-400">
          <svg className="mx-auto h-16 w-16 text-senai-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold">Error loading events</h3>
          <p className="mt-2">Please try again later</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-senai-red-600 hover:bg-senai-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-senai-red-500"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-senai-red-500 mb-4">
          Upcoming Events
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Discover and register for upcoming SENAI events
        </p>
        <div className="max-w-xl mx-auto relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-senai-red-500 focus:border-senai-red-500 transition-shadow"
          />
        </div>
      </motion.div>

      {filteredEvents.length === 0 ? (
        <Text variant="body">No events found.</Text>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredEvents.map((event) => (
            <motion.div key={event.id} variants={item}>
                <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
