import React, { useState } from 'react';
import { Medal, List, Table } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface TeamPoints {
  schoolId: string;
  schoolName: string;
  totalPoints: number;
  breakdown: Array<{
    eventName: string;
    athleteName?: string;
    position: number;
    points: number;
    type: 'individual' | 'relay';
  }>;
}

export function TeamPointsDisplay() {
  const { schools, athletes, trackEvents } = useData();
  const [heats] = useLocalStorage('heats', []);
  const [finalPositions] = useLocalStorage('finalPositions', {});
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');

  // Points system
  const individualPointsMap = {
    1: 9,  // Gold
    2: 7,  // Silver
    3: 6,  // Bronze
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1
  };

  // Points system for relay events
  const relayPointsMap = {
    1: 12, // Gold
    2: 10, // Silver
    3: 8,  // Bronze
    4: 6,
    5: 5,
    6: 4,
    7: 3,
    8: 2
  };

  // Calculate team points from finals data
  const calculateTeamPoints = () => {
    const schoolPoints: Record<string, TeamPoints> = {};

    // Initialize points for all schools
    schools.forEach(school => {
      schoolPoints[school.id] = {
        schoolId: school.id,
        schoolName: school.name,
        totalPoints: 0,
        breakdown: []
      };
    });

    // Process all events
    trackEvents.forEach(event => {
      const eventHeats = heats.filter(heat => heat.eventId === event.id);
      const allLanes = eventHeats.flatMap(heat => heat.lanes);
      
      // Get finalists with positions
      const finalists = allLanes
        .filter(lane => {
          const position = finalPositions[`${event.id}-${lane.athleteId}`];
          return position !== undefined;
        })
        .map(lane => {
          const position = finalPositions[`${event.id}-${lane.athleteId}`];
          return { ...lane, position };
        });

      finalists.forEach(finalist => {
        if (event.type === 'relay') {
          // For relay events, athleteId is schoolId
          const schoolId = finalist.athleteId;
          const points = relayPointsMap[finalist.position] || 0;
          
          if (schoolPoints[schoolId]) {
            schoolPoints[schoolId].totalPoints += points;
            schoolPoints[schoolId].breakdown.push({
              eventName: `${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} ${event.name}`,
              position: finalist.position,
              points,
              type: 'relay'
            });
          }
        } else {
          // For individual events
          const athlete = athletes.find(a => a.id === finalist.athleteId);
          if (athlete) {
            const points = individualPointsMap[finalist.position] || 0;
            
            if (schoolPoints[athlete.schoolId]) {
              schoolPoints[athlete.schoolId].totalPoints += points;
              schoolPoints[athlete.schoolId].breakdown.push({
                eventName: `${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} ${event.name}`,
                athleteName: athlete.name,
                position: finalist.position,
                points,
                type: 'individual'
              });
            }
          }
        }
      });
    });

    return Object.values(schoolPoints)
      .filter(school => school.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const teamPoints = calculateTeamPoints();

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
      <div className="text-center py-8 text-gray-500">
        <Medal className="w-12 h-12 mx-auto mb-4" />
        <p>No team points available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setViewMode('simple')}
          className={`p-2 rounded-lg ${
            viewMode === 'simple' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Simple View"
        >
          <List className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('detailed')}
          className={`p-2 rounded-lg ${
            viewMode === 'detailed' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Detailed View"
        >
          <Table className="w-5 h-5" />
        </button>
      </div>

      {viewMode === 'simple' ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teamPoints.map((school, index) => (
                <tr key={school.schoolId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 && <Medal className={`w-5 h-5 mr-2 ${getMedalColor(index + 1)}`} />}
                      <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{school.schoolName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-bold text-gray-900">{school.totalPoints}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
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
      )}
    </div>
  );
}