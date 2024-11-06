import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Athlete, School } from '../types';

interface AddAthleteModalProps {
  athletes: Athlete[];
  schools: School[];
  onClose: () => void;
  onAddAthlete: (athleteId: string) => void;
  isRelay?: boolean;
}

export function AddAthleteModal({
  athletes,
  schools,
  onClose,
  onAddAthlete,
  isRelay = false
}: AddAthleteModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter schools or athletes based on search term
  const filteredItems = isRelay
    ? schools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : athletes.filter(athlete =>
        athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schools.find(s => s.id === athlete.schoolId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Add {isRelay ? 'School' : 'Athlete'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${isRelay ? 'schools' : 'athletes'}...`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isRelay ? (
              // Render schools list for relay events
              filteredItems.map((school: School) => (
                <div
                  key={school.id}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => {
                    onAddAthlete(school.id);
                    onClose();
                  }}
                >
                  <div className="font-medium">{school.name}</div>
                </div>
              ))
            ) : (
              // Render athletes list for individual events
              filteredItems.map((athlete: Athlete) => (
                <div
                  key={athlete.id}
                  className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => {
                    onAddAthlete(athlete.id);
                    onClose();
                  }}
                >
                  <div>
                    <div className="font-medium">{athlete.name}</div>
                    <div className="text-sm text-gray-500">
                      {schools.find(s => s.id === athlete.schoolId)?.name}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {athlete.ageCategory}
                  </div>
                </div>
              ))
            )}
            {filteredItems.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No {isRelay ? 'schools' : 'athletes'} found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}