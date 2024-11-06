import React from 'react';
import { useData } from '../context/DataContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function ResultsView() {
  const { athletes, schools, trackEvents } = useData();
  const [finalPositions] = useLocalStorage('finalPositions', {});

  // Points system
  const pointsMap = {
    1: 9,
    2: 7,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1
  };

  // Get all athletes with positions
  const athleteResults = [];

  // Process all final positions
  Object.entries(finalPositions).forEach(([key, position]) => {
    if (!position) return;

    const [eventId, athleteId] = key.split('-');
    const event = trackEvents.find(e => e.id === eventId);
    const athlete = athletes.find(a => a.id === athleteId);
    const school = schools.find(s => s.id === athlete?.schoolId);
    
    if (event && athlete && school && event.type !== 'relay') {
      athleteResults.push({
        name: athlete.name,
        school: school.name,
        event: `${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} ${event.name}`,
        position,
        points: pointsMap[position] || 0
      });
    }
  });

  if (athleteResults.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Athletes Rankings</h2>
        <p className="text-gray-600 mb-8">Individual rankings and achievements</p>
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          No athletes have earned points yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Athletes Rankings</h2>
      <p className="text-gray-600 mb-8">Individual rankings and achievements</p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Athlete</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Points</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {athleteResults.map((result, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {result.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.school}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.event}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {result.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  {result.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}