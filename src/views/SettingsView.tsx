import React from 'react';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';

export function SettingsView() {
  const { 
    setSchools, 
    setAthletes, 
    setMeets, 
    setTrackEvents, 
    setHeats 
  } = useData();

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setSchools([]);
      setAthletes([]);
      setMeets([]);
      setTrackEvents([]);
      setHeats([]);
      localStorage.clear();
      alert('All data has been cleared successfully.');
    }
  };

  const handleClearTeams = () => {
    if (window.confirm('Are you sure you want to clear all teams? This will also remove related athletes and entries.')) {
      setSchools([]);
      setAthletes([]);
      alert('All teams and related data have been cleared successfully.');
    }
  };

  const handleClearAthletes = () => {
    if (window.confirm('Are you sure you want to clear all athletes and their entries?')) {
      setAthletes([]);
      alert('All athletes and their entries have been cleared successfully.');
    }
  };

  const handleClearEvents = () => {
    if (window.confirm('Are you sure you want to clear all events? This will also clear related meets and heats.')) {
      setTrackEvents([]);
      setMeets([]);
      setHeats([]);
      alert('All events and related data have been cleared successfully.');
    }
  };

  const handleClearResults = () => {
    if (window.confirm('Are you sure you want to clear all heats and finals results?')) {
      setHeats([]);
      localStorage.removeItem('finalPositions');
      alert('All results have been cleared successfully.');
    }
  };

  const handleClearEntries = () => {
    if (window.confirm('Are you sure you want to clear all event entries? Athletes will remain but their event registrations will be removed.')) {
      setAthletes(prevAthletes => prevAthletes.map(athlete => ({
        ...athlete,
        events: []
      })));
      alert('All event entries have been cleared successfully.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-2">Manage application data and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Data Management</h3>

        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-red-800">Danger Zone</h4>
                <p className="text-sm text-red-600 mt-1">
                  These actions cannot be undone. Please be certain before proceeding.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <button
                onClick={handleClearAllData}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Clear All Data
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleClearTeams}
                  className="flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Clear Teams
                </button>

                <button
                  onClick={handleClearAthletes}
                  className="flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Clear Athletes
                </button>

                <button
                  onClick={handleClearEvents}
                  className="flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Clear Events
                </button>

                <button
                  onClick={handleClearResults}
                  className="flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Clear Results
                </button>

                <button
                  onClick={handleClearEntries}
                  className="flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Clear Entries
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}