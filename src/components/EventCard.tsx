import React from 'react';
import { Clock, Users, Medal, School } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onSelect: (eventId: string) => void;
}

export function EventCard({ event, onSelect }: EventCardProps) {
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  const divisionColors = {
    junior: 'text-orange-600',
    senior: 'text-purple-600'
  };

  return (
    <div 
      onClick={() => onSelect(event.id)}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
          <div className="flex items-center mt-1 space-x-2">
            <span className={`text-sm font-medium ${divisionColors[event.division]}`}>
              {event.division.toUpperCase()}
            </span>
            <span className="text-sm text-gray-500">• {event.gender === 'mixed' ? 'Mixed' : event.gender}</span>
            <span className="text-sm text-gray-500">• {event.ageGroup}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[event.status]}`}>
          {event.status}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>{new Date(event.startTime).toLocaleTimeString()}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>{event.participants.length} Athletes</span>
        </div>

        <div className="flex items-center text-gray-600">
          <School className="w-4 h-4 mr-2" />
          <span>Max {event.maxParticipantsPerSchool} per school</span>
        </div>
        
        {event.status === 'completed' && (
          <div className="flex items-center text-gray-600">
            <Medal className="w-4 h-4 mr-2" />
            <span>Results Available</span>
          </div>
        )}
      </div>
    </div>
  );
}