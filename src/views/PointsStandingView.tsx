import React, { useState, useMemo } from 'react';
import { Trophy, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PointBreakdown {
  eventId: string;
  athleteName: string;
  eventName: string;
  position: number;
  points: number;
}

interface SchoolPoints {
  schoolId: string;
  schoolName: string;
  totalPoints: number;
  breakdown: PointBreakdown[];
}

export function PointsStandingView() {
  const { schools, athletes, trackEvents } = useData();
  const [finalPositions] = useLocalStorage('finalPositions', {});
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  // Points system
  const pointsMap: Record<number, number> = {
    1: 10, // Gold
    2: 8,  // Silver
    3: 6,  // Bronze
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1
  };

  // Calculate points for each school using useMemo
  const schoolPointsData = useMemo(() => {
    // Initialize points data structure for each school
    const schoolPoints: Record<string, SchoolPoints> = {};
    
    // Initialize each school's data
    schools.forEach(school => {
      schoolPoints[school.id] = {
        schoolId: school.id,
        schoolName: school.name,
        totalPoints: 0,
        breakdown: []
      };
    });

    // Group final positions by event
    const eventPositions: Record<string, Array<{ athleteId: string; position: number }>> = {};
    
    // Process all final positions and group by event
    Object.entries(finalPositions).forEach(([key, position]) => {
      if (!position) return;
      
      const [eventId, athleteId] = key.split('-');
      if (!eventPositions[eventId]) {
        eventPositions[eventId] = [];
      }
      
      eventPositions[eventId].push({
        athleteId,
        position: Number(position)
      });
    });

    // Process each event's positions
    Object.entries(eventPositions).forEach(([eventId, positions]) => {
      const event = trackEvents.find(e => e.id === eventId);
      if (!event) return;

      // Sort positions for this event
      const sortedPositions = positions.sort((a, b) => a.position - b.position);

      // Award points for each position
      sortedPositions.forEach(({ athleteId, position }) => {
        const athlete = athletes.find(a => a.id === athleteId);
        if (!athlete) return;

        const points = pointsMap[position] || 0;
        const schoolId = athlete.schoolId;

        if (schoolPoints[schoolId]) {
          // Add points to school total
          schoolPoints[schoolId].totalPoints += points;

          // Add to breakdown
          schoolPoints[schoolId].breakdown.push({
            eventId,
            athleteName: athlete.name,
            eventName: `${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} - ${event.name}`,
            position,
            points
          });
        }
      });
    });

    // Convert to array and sort by total points
    return Object.values(schoolPoints)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .filter(school => school.totalPoints > 0 || school.breakdown.length > 0);
  }, [schools, athletes, trackEvents, finalPositions]);

  const getPositionStyle = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-50';
      case 1: return 'bg-gray-50';
      case 2: return 'bg-orange-50';
      default: return '';
    }
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-orange-500';
      default: return 'text-gray-400';
    }
  };

  if (schoolPointsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)]">
        <Trophy className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600">No Points Available</h3>
        <p className="text-gray-500 mt-2">Complete some finals to see points standings</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Points Standing</h2>
        <p className="text-gray-600 mt-2">Overall team rankings and points</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schoolPointsData.map((school, index) => (
              <React.Fragment key={school.schoolId}>
                <tr className={getPositionStyle(index)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 && (
                        <Medal className={`w-5 h-5 mr-2 ${getMedalColor(index + 1)}`} />
                      )}
                      <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{school.schoolName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-gray-900">{school.totalPoints}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => setExpandedSchool(expandedSchool === school.schoolId ? null : school.schoolId)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {expandedSchool === school.schoolId ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedSchool === school.schoolId && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 bg-gray-50">
                      <div className="text-sm text-gray-600">
                        <h4 className="font-semibold mb-2">Points Breakdown</h4>
                        {school.breakdown.length > 0 ? (
                          <table className="min-w-full">
                            <thead>
                              <tr className="text-xs text-gray-500 uppercase">
                                <th className="py-2 text-left">Event</th>
                                <th className="py-2 text-left">Athlete</th>
                                <th className="py-2 text-center">Position</th>
                                <th className="py-2 text-right">Points</th>
                              </tr>
                            </thead>
                            <tbody>
                              {school.breakdown
                                .sort((a, b) => b.points - a.points)
                                .map((entry, i) => (
                                  <tr key={`${entry.eventId}-${i}`} className="border-t border-gray-200">
                                    <td className="py-2 text-left">{entry.eventName}</td>
                                    <td className="py-2 text-left">{entry.athleteName}</td>
                                    <td className="py-2 text-center">
                                      <span className={`inline-flex items-center ${getMedalColor(entry.position)}`}>
                                        {entry.position}
                                        {entry.position <= 3 && <Medal className="w-4 h-4 ml-1" />}
                                      </span>
                                    </td>
                                    <td className="py-2 text-right font-medium">{entry.points}</td>
                                  </tr>
                                ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-gray-300">
                                <td colSpan={3} className="py-2 text-right font-semibold">Total Points:</td>
                                <td className="py-2 text-right font-bold">{school.totalPoints}</td>
                              </tr>
                            </tfoot>
                          </table>
                        ) : (
                          <p className="text-gray-500 italic">No points earned yet</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}