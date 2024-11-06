import React from 'react';
import { Users, Trophy, Calendar, School } from 'lucide-react';
import { useData } from '../../context/DataContext';

export function DashboardStats() {
  const { schools, athletes, trackEvents } = useData();

  // Calculate statistics
  const totalSchools = schools.length;
  const totalEvents = trackEvents.length;
  
  const participantStats = {
    total: athletes.length,
    male: athletes.filter(a => a.gender === 'M').length,
    female: athletes.filter(a => a.gender === 'F').length,
    byAge: {
      U9: athletes.filter(a => a.ageCategory === 'U9').length,
      U11: athletes.filter(a => a.ageCategory === 'U11').length,
      U13: athletes.filter(a => a.ageCategory === 'U13').length,
      U15: athletes.filter(a => a.ageCategory === 'U15').length,
      Open: athletes.filter(a => a.ageCategory === 'Open').length,
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Meet Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <School className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Schools</p>
              <p className="text-xl font-bold text-gray-900">{totalSchools}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Events</p>
              <p className="text-xl font-bold text-gray-900">{totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Athletes</p>
              <p className="text-xl font-bold text-gray-900">{participantStats.total}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gender Split</p>
              <p className="text-xl font-bold text-gray-900">
                {participantStats.male}M / {participantStats.female}F
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Age Categories</h4>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(participantStats.byAge).map(([category, count]) => (
            <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">{category}</p>
              <p className="text-lg font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}