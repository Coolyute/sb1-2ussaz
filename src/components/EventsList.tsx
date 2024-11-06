import React from 'react';
import { TrackEvent } from '../types';

interface EventsListProps {
  events: TrackEvent[];
  selectedEvent: string | null;
  onEventSelect: (eventId: string) => void;
  onGenerateHeats: (eventId: string) => void;
  activeTab: 'individual' | 'relay';
  onTabChange: (tab: 'individual' | 'relay') => void;
}

export function EventsList({
  events,
  selectedEvent,
  onEventSelect,
  onGenerateHeats,
  activeTab,
  onTabChange
}: EventsListProps) {
  const filteredEvents = events.filter(event => 
    activeTab === 'relay' ? event.type === 'relay' : event.type !== 'relay'
  );

  return (
    <div className="w-1/4 border-r bg-white p-4 overflow-y-auto">
      <div className="mb-4">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => onTabChange('individual')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'individual'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Individual Events
          </button>
          <button
            onClick={() => onTabChange('relay')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'relay'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Relay Events
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredEvents.map(event => (
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
              <span>{`${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} - ${event.name}`}</span>
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