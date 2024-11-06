import React, { useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { AthleteForm } from '../components/AthleteForm';
import { Athlete } from '../types';
import { useData } from '../context/DataContext';

export function AthletesView() {
  const { athletes, setAthletes, schools } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | undefined>();

  const handleAddAthlete = (athleteData: Omit<Athlete, 'id'>) => {
    const newAthlete = {
      ...athleteData,
      id: `${Date.now()}`,
    };
    setAthletes([...athletes, newAthlete]);
    setShowForm(false);
  };

  const handleEditAthlete = (athleteData: Omit<Athlete, 'id'>) => {
    if (!selectedAthlete) return;
    const updatedAthletes = athletes.map(athlete =>
      athlete.id === selectedAthlete.id ? { ...athleteData, id: athlete.id } : athlete
    );
    setAthletes(updatedAthletes);
    setShowForm(false);
    setSelectedAthlete(undefined);
  };

  const handleDeleteAthlete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this athlete?')) {
      setAthletes(athletes.filter(athlete => athlete.id !== id));
    }
  };

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Athletes</h2>
          <p className="text-gray-600 mt-2">Manage student participants</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search athletes..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button 
            onClick={() => {
              setSelectedAthlete(undefined);
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Athlete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAthletes.map(athlete => (
              <tr key={athlete.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{athlete.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {schools.find(s => s.id === athlete.schoolId)?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(athlete.dateOfBirth).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{athlete.gender}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {athlete.ageCategory}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {athlete.events.join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedAthlete(athlete);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAthlete(athlete.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <AthleteForm
          athlete={selectedAthlete}
          onSubmit={selectedAthlete ? handleEditAthlete : handleAddAthlete}
          onClose={() => {
            setShowForm(false);
            setSelectedAthlete(undefined);
          }}
        />
      )}
    </div>
  );
}