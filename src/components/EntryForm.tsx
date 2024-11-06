import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext';

interface EntryFormProps {
  entry?: { athleteId: string; eventName: string } | null;
  onSubmit: (entry: { athleteId: string; eventId: string }) => void;
  onClose: () => void;
  activeTab: 'individual' | 'relay';
}

export function EntryForm({ entry, onSubmit, onClose, activeTab }: EntryFormProps) {
  const { athletes, schools, trackEvents } = useData();
  const [selectedSchool, setSelectedSchool] = useState('');
  const [formData, setFormData] = useState({
    athleteId: entry?.athleteId || '',
    eventId: trackEvents.find(e => e.name === entry?.eventName)?.id || ''
  });

  // Filter events based on the active tab
  const filteredEvents = useMemo(() => {
    return trackEvents.filter(event => 
      activeTab === 'relay' ? event.type === 'relay' : event.type !== 'relay'
    );
  }, [trackEvents, activeTab]);

  const selectedEvent = trackEvents.find(e => e.id === formData.eventId);

  // Filter athletes based on selected school and event requirements
  const eligibleAthletes = useMemo(() => {
    if (!selectedEvent || !selectedSchool || activeTab === 'relay') return [];

    return athletes.filter(athlete => 
      athlete.schoolId === selectedSchool &&
      athlete.gender === selectedEvent.gender &&
      athlete.ageCategory === selectedEvent.ageGroup
    );
  }, [athletes, selectedEvent, selectedSchool, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'relay') {
      // For relay entries, use the school ID as the athlete ID
      onSubmit({
        athleteId: selectedSchool,
        eventId: formData.eventId
      });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {entry ? 'Edit Event Entry' : `Add ${activeTab === 'relay' ? 'Relay' : 'Individual'} Entry`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event</label>
            <select
              value={formData.eventId}
              onChange={(e) => {
                setFormData({ ...formData, eventId: e.target.value, athleteId: '' });
                setSelectedSchool('');
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select an event</option>
              {filteredEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {`${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} - ${event.name}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">School</label>
            <select
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                if (activeTab === 'relay') {
                  setFormData(prev => ({ ...prev, athleteId: e.target.value }));
                } else {
                  setFormData(prev => ({ ...prev, athleteId: '' }));
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'individual' && selectedSchool && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Athlete</label>
              <select
                value={formData.athleteId}
                onChange={(e) => setFormData(prev => ({ ...prev, athleteId: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select an athlete</option>
                {eligibleAthletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              disabled={!selectedSchool || (activeTab === 'individual' && !formData.athleteId)}
            >
              {entry ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}