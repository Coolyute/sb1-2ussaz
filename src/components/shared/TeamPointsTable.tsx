import React from 'react';
import { Medal } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface TeamPointsTableProps {
  variant?: 'dashboard' | 'full';
}

export function TeamPointsTable({ variant = 'dashboard' }: TeamPointsTableProps) {
  const { schools, athletes, trackEvents } = useData();
  const [finalPositions] = useLocalStorage('finalPositions', {});

  // Points system for individual events
  const individualPointsMap: Record<number, number> = {
    1: 9, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
  };

  // Points system for relay events
  const relayPointsMap: Record<number, number> = {
    1: 12, 2: 10, 3: 8, 4: 6, 5: 5, 6: 4, 7: 3, 8: 2
  };

  const calculateSchoolPoints = () => {
    const points: Record<string, number> = {};

    // Initialize points for all schools
    schools.forEach(school => {
      points[school.id] = 0;
    });

    // Calculate points from final positions
    Object.entries(finalPositions || {}).forEach(([key, position]) => {
      if (!position) return;
      
      const [eventId, participantId] = key.split('-');
      const event = trackEvents.find(e => e.id === eventId);
      
      if (!event) return;

      if (event.type === 'relay') {
        // For relay events, participantId is the school ID
        const pointsValue = relayPointsMap[position] || 0;
        points[participantId] = (points[participantId] || 0) + pointsValue;
      } else {
        // For individual events, look up the athlete's school
        const athlete = athletes.find(a => a.id === participantId);
        if (athlete) {
          const pointsValue = individualPointsMap[position] || 0;
          points[athlete.schoolId] = (points[athlete.schoolId] || 0) + pointsValue;
        }
      }
    });

    return points;
  };

  const schoolPoints = calculateSchoolPoints();
  const sortedSchools = schools
    .map(school => ({
      ...school,
      points: schoolPoints[school.id] || 0
    }))
    .filter(school => school.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, variant === 'dashboard' ? 5 : undefined);

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-orange-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Team Points</h3>
      <div className="space-y-2">
        {sortedSchools.map((school, index) => (
          <div
            key={school.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center">
              {index < 3 && <Medal className={`w-5 h-5 mr-2 ${getMedalColor(index + 1)}`} />}
              <span className={`${index < 3 ? 'font-medium' : ''} text-gray-900`}>
                {school.name}
              </span>
            </div>
            <span className="font-bold text-gray-900">{school.points} pts</span>
          </div>
        ))}

        {sortedSchools.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No points data available
          </div>
        )}
      </div>
    </div>
  );
}