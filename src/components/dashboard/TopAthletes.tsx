import React from 'react';
import { Medal } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function TopAthletes() {
  const { athletes, schools, trackEvents } = useData();
  const [finalPositions] = useLocalStorage('finalPositions', {});

  const pointsMap: Record<number, number> = {
    1: 9, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
  };

  const ageGroups = ['U9', 'U11', 'U13', 'U15', 'Open'];
  const genders = ['M', 'F'];

  const calculateAthletePoints = () => {
    const points: Record<string, number> = {};

    Object.entries(finalPositions || {}).forEach(([key, position]) => {
      const [eventId, athleteId] = key.split('-');
      if (position) {
        points[athleteId] = (points[athleteId] || 0) + (pointsMap[position as number] || 0);
      }
    });

    return points;
  };

  const getTopAthletesByCategory = (ageGroup: string, gender: 'M' | 'F') => {
    const athletePoints = calculateAthletePoints();
    
    return athletes
      .filter(athlete => athlete.ageCategory === ageGroup && athlete.gender === gender)
      .map(athlete => ({
        ...athlete,
        points: athletePoints[athlete.id] || 0,
        school: schools.find(s => s.id === athlete.schoolId)?.name || ''
      }))
      .filter(athlete => athlete.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Athletes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ageGroups.map(ageGroup => (
          <React.Fragment key={ageGroup}>
            {genders.map(gender => {
              const topAthletes = getTopAthletesByCategory(ageGroup, gender as 'M' | 'F');
              if (topAthletes.length === 0) return null;

              return (
                <div key={`${ageGroup}-${gender}`} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {gender === 'M' ? 'Boys' : 'Girls'} {ageGroup}
                  </h4>
                  <div className="space-y-2">
                    {topAthletes.map((athlete, index) => (
                      <div key={athlete.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Medal className={`w-4 h-4 mr-2 ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            'text-orange-500'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{athlete.name}</p>
                            <p className="text-xs text-gray-500">{athlete.school}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{athlete.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}