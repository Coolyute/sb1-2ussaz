import React from 'react';
import { TrackEvent } from '../types';

interface EventListProps {
  events: TrackEvent[];
  selectedEvent: string | null;
  onEventSelect: (eventId: string) => void;
  onGenerateHeats: (eventId: string) => void;
  activeTab: 'individual' | 'relay';
  onTabChange: (tab: 'individual' | 'relay') => void;
}

export function EventList({
  events,
  selectedEvent,
  onEventSelect,
  onGenerateHeats,
  activeTab,
  onTabChange
}: EventListProps) {
  // Sort events by type
  const sortedEvents = events.reduce(
    (acc, event) => {
      if (event.type === 'relay') {
        acc.relays.push(event);
      } else {
        acc.others.push(event);
      }
      return acc;
    },
    { relays: [] as TrackEvent[], others: [] as TrackEvent[] }
  );

  // Get current events based on active tab
  const currentEvents = activeTab === 'individual' ? sortedEvents.others : sortedEvents.relays;

  // Format event names
  const formattedEvents = currentEvents.map(event => ({
    ...event,
    displayName: `${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} - ${event.name}`
  }));

  return (
    <div className="w-1/4 border-r bg-white p-4 overflow-y-auto">
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => onTabChange('individual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'individual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Individual Events
            </button>
            <button
              onClick={() => onTabChange('relay')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'relay'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Relay Events
            </button>
          </nav>
        </div>
      </div>

      <div className="space-y-2">
        {formattedEvents.map(event => (
          <div
            key={event.id}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedEvent === event.id
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onEventSelect(event.id)}
          >
            <div className="flex items-center justify-between">
              <span>{event.displayName}</span>
              {selectedEvent === event.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateHeats(event.id);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Generate Heats
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}