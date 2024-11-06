import React from 'react';
import { Medal } from 'lucide-react';
import { calculateTeamPoints } from './TeamPointsCalculator';
import { useData } from '../../context/DataContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function TeamPointsDisplay() {
  const { schools, athletes, trackEvents } = useData();
  const [finalPositions] = useLocalStorage('finalPositions', {});

  const teamPoints = calculateTeamPoints(schools, athletes, trackEvents, finalPositions);

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  if (teamPoints.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Team Points</h2>
          <p className="text-gray-600 mt-2">School rankings and points breakdown</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Medal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No Points Yet</h3>
          <p className="text-gray-500 mt-2">
            Complete some finals to see team points
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Team Points</h2>
        <p className="text-gray-600 mt-2">School rankings and points breakdown</p>
      </div>

      <div className="space-y-6">
        {teamPoints.map((school, index) => (
          <div key={school.schoolId} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {index < 3 && (
                    <Medal className={`w-6 h-6 mr-2 ${getMedalColor(index + 1)}`} />
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{school.schoolName}</h3>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {school.totalPoints} points
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Points Breakdown</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="text-left py-2">Event</th>
                        <th className="text-left py-2">Type</th>
                        <th className="text-left py-2">Athlete</th>
                        <th className="text-center py-2">Position</th>
                        <th className="text-right py-2">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {school.breakdown
                        .sort((a, b) => b.points - a.points)
                        .map((entry, i) => (
                          <tr key={i} className="border-t border-gray-200">
                            <td className="py-2 text-left">{entry.eventName}</td>
                            <td className="py-2 text-left capitalize">{entry.type}</td>
                            <td className="py-2 text-left">
                              {entry.type === 'relay' ? school.schoolName : entry.athleteName}
                            </td>
                            <td className="py-2 text-center">
                              <span className={`inline-flex items-center ${getMedalColor(entry.position)}`}>
                                {entry.position}
                                {entry.position <= 3 && (
                                  <Medal className="w-4 h-4 ml-1" />
                                )}
                              </span>
                            </td>
                            <td className="py-2 text-right font-medium">{entry.points}</td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan={4} className="py-2 text-right font-semibold">
                          Total Points:
                        </td>
                        <td className="py-2 text-right font-bold">
                          {school.totalPoints}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}