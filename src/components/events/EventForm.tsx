import React from 'react';
import { Trash2 } from 'lucide-react';
import { TrackEvent } from '../../types';

interface EventFormProps {
  event: Omit<TrackEvent, 'id'>;
  isEditing: boolean;
  onSubmit: (event: Omit<TrackEvent, 'id'>) => void;
  onChange: (event: Omit<TrackEvent, 'id'>) => void;
  onClose: () => void;
}

export function EventForm({
  event,
  isEditing,
  onSubmit,
  onChange,
  onClose
}: EventFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(event);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Name</label>
            <input
              type="text"
              value={event.name}
              onChange={(e) => onChange({ ...event, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={event.type}
              onChange={(e) => onChange({ ...event, type: e.target.value as 'track' | 'field' | 'relay' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="track">Track</option>
              <option value="field">Field</option>
              <option value="relay">Relay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              value={event.gender}
              onChange={(e) => onChange({ ...event, gender: e.target.value as 'M' | 'F' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="M">Boys</option>
              <option value="F">Girls</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age Group</label>
            <select
              value={event.ageGroup}
              onChange={(e) => onChange({ ...event, ageGroup: e.target.value as 'U9' | 'U11' | 'U13' | 'U15' | 'Open' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="U9">Under 9</option>
              <option value="U11">Under 11</option>
              <option value="U13">Under 13</option>
              <option value="U15">Under 15</option>
              <option value="Open">Open</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}