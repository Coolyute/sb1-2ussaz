import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Meet } from '../types';
import { useData } from '../context/DataContext';
import { EventForm } from '../components/EventForm';

export function MeetsView() {
  const { meets, setMeets, trackEvents } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingMeet, setEditingMeet] = useState<Meet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (meetData: Omit<Meet, 'id' | 'participants' | 'results' | 'status'>) => {
    if (editingMeet) {
      setMeets(meets.map(meet =>
        meet.id === editingMeet.id
          ? { ...editingMeet, ...meetData, participants: [], results: {}, status: 'upcoming' }
          : meet
      ));
    } else {
      const newMeet: Meet = {
        id: Date.now().toString(),
        ...meetData,
        participants: [],
        results: {},
        status: 'upcoming'
      };
      setMeets([...meets, newMeet]);
    }
    setShowForm(false);
    setEditingMeet(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this meet?')) {
      setMeets(meets.filter(meet => meet.id !== id));
    }
  };

  const filteredMeets = meets.filter(meet =>
    meet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Track & Field Meets</h2>
          <p className="text-gray-600 mt-2">Schedule and manage competition events</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search meets..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button 
            onClick={() => {
              setEditingMeet(null);
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Meet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeets.map(meet => (
          <div key={meet.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{meet.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(meet.startTime).toLocaleDateString()} at{' '}
                  {new Date(meet.startTime).toLocaleTimeString()}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                meet.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                meet.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {meet.status.charAt(0).toUpperCase() + meet.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Event Type:</span>
                <span className="font-medium text-gray-900">{meet.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium text-gray-900">{meet.gender}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Max per School:</span>
                <span className="font-medium text-gray-900">{meet.maxParticipantsPerSchool}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingMeet(meet);
                  setShowForm(true);
                }}
                className="p-2 text-blue-600 hover:text-blue-800"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(meet.id)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <EventForm
          event={editingMeet}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingMeet(null);
          }}
        />
      )}
    </div>
  );
}