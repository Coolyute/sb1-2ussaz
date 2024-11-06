import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Athlete, School, RelayTeam } from '../types';

interface RelayTeamFormProps {
  relayTeam?: RelayTeam;
  school: School;
  athletes: Athlete[];
  onSubmit: (team: Omit<RelayTeam, 'id'>) => void;
  onClose: () => void;
  ageGroup: string;
  gender: 'M' | 'F';
  eventId: string;
}

export function RelayTeamForm({
  relayTeam,
  school,
  athletes,
  onSubmit,
  onClose,
  ageGroup,
  gender,
  eventId
}: RelayTeamFormProps) {
  const [selectedAthletes, setSelectedAthletes] = useState<Array<{ athleteId: string; position: number }>>(
    relayTeam?.athletes || []
  );

  const availableAthletes = athletes.filter(athlete => 
    athlete.schoolId === school.id &&
    athlete.gender === gender &&
    athlete.ageCategory === ageGroup &&
    !selectedAthletes.find(selected => selected.athleteId === athlete.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAthletes.length !== 4) {
      alert('Please select exactly 4 athletes for the relay');
      return;
    }

    onSubmit({
      schoolId: school.id,
      eventId,
      ageGroup: ageGroup as 'U9' | 'U11' | 'U13' | 'U15' | 'Open',
      gender,
      athletes: selectedAthletes
    });
  };

  const handleAthleteAdd = (athleteId: string, position: number) => {
    if (selectedAthletes.length >= 4) {
      alert('A relay can only have 4 athletes');
      return;
    }
    
    if (selectedAthletes.find(a => a.position === position)) {
      alert('This position is already filled');
      return;
    }

    setSelectedAthletes([...selectedAthletes, { athleteId, position }]);
  };

  const handleAthleteRemove = (athleteId: string) => {
    setSelectedAthletes(selectedAthletes.filter(a => a.athleteId !== athleteId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {relayTeam ? 'Edit Relay Entry' : 'Create Relay Entry'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Entry Details</h3>
            <p className="text-sm text-gray-500">School: {school.name}</p>
            <p className="text-sm text-gray-500">Age Group: {ageGroup}</p>
            <p className="text-sm text-gray-500">Gender: {gender === 'M' ? 'Boys' : 'Girls'}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select Athletes</h3>
            {[1, 2, 3, 4].map(position => (
              <div key={position} className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Position {position}</h4>
                {selectedAthletes.find(a => a.position === position) ? (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-900">
                      {athletes.find(a => a.id === selectedAthletes.find(sa => sa.position === position)?.athleteId)?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAthleteRemove(selectedAthletes.find(a => a.position === position)!.athleteId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    onChange={(e) => handleAthleteAdd(e.target.value, position)}
                    value=""
                  >
                    <option value="">Select athlete</option>
                    {availableAthletes.map(athlete => (
                      <option key={athlete.id} value={athlete.id}>
                        {athlete.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
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
              disabled={selectedAthletes.length !== 4}
            >
              {relayTeam ? 'Save Changes' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}