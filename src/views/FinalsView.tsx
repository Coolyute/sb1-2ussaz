import React, { useState, useEffect } from 'react';
import { Medal, Trophy, X } from 'lucide-react';
import { useData } from "../context/DataContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { TrackEvent } from '../types';

interface EditingPosition {
  athleteId: string;
  position?: number;
}

interface TeamPoints {
  id: string;
  name: string;
  points: number;
}

export function FinalsView() {
  const { athletes, schools, trackEvents } = useData();
  const [heats] = useLocalStorage('heats', []);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<EditingPosition | null>(null);
  const [finalPositions, setFinalPositions] = useLocalStorage('finalPositions', {});
  const [finalists, setFinalists] = useState<any[]>([]);
  const [teamPoints, setTeamPoints] = useState<TeamPoints[]>([]);
  const [activeTab, setActiveTab] = useState<'individual' | 'relay'>('individual');

  // Points system
  const individualPointsMap: Record<number, number> = {
    1: 9,
    2: 7,
    3: 6,
    4: 5,
    5: 4,
    6: 3,
    7: 2,
    8: 1
  };

  // Relay points system
  const relayPointsMap: Record<number, number> = {
    1: 12,
    2: 10,
    3: 8,
    4: 6,
    5: 5,
    6: 4,
    7: 3,
    8: 2
  };

  // Lane assignment order for top 8 athletes
  const laneAssignmentOrder = [4, 5, 3, 6, 7, 2, 8, 1];

  const formatEventName = (event: TrackEvent) => {
    return `${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} - ${event.name} Final`;
  };

  // Get unique events with proper naming structure and sort by age group
  const formattedEvents = trackEvents
    .filter(event => activeTab === 'relay' ? event.type === 'relay' : event.type !== 'relay')
    .map(event => ({
      ...event,
      displayName: formatEventName(event)
    }))
    .sort((a, b) => {
      // Define age group order
      const ageOrder = {
        'U9': 1,
        'U11': 2,
        'U13': 3,
        'U15': 4,
        'Open': 5
      };

      // First sort by age group
      const ageCompare = ageOrder[a.ageGroup] - ageOrder[b.ageGroup];
      if (ageCompare !== 0) return ageCompare;

      // Then by gender (Boys before Girls)
      if (a.gender !== b.gender) {
        return a.gender === 'M' ? -1 : 1;
      }

      // Finally by event name
      return a.name.localeCompare(b.name);
    });

  // Calculate team points for all events
  useEffect(() => {
    const allPoints: Record<string, number> = {};
    const allEventPoints: Record<string, TeamPoints[]> = {};

    // Initialize points for all schools
    schools.forEach(school => {
      allPoints[school.id] = 0;
    });

    // Calculate points for each event
    trackEvents.forEach(event => {
      const eventHeats = heats.filter(heat => heat.eventId === event.id);
      const allLanes = eventHeats.flatMap(heat => heat.lanes);
      
      // Get finalists for this event
      const eventFinalists = allLanes
        .filter(lane => lane.position !== undefined)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .slice(0, 8);

      // Calculate points for this event
      eventFinalists.forEach(finalist => {
        const position = finalPositions[`${event.id}-${finalist.athleteId}`];
        if (position) {
          // For relay events, athleteId is actually schoolId
          const pointsMap = event.type === 'relay' ? relayPointsMap : individualPointsMap;
          const points = pointsMap[position] || 0;
          const schoolId = event.type === 'relay' ? finalist.athleteId : athletes.find(a => a.id === finalist.athleteId)?.schoolId;
          
          if (schoolId && allPoints[schoolId] !== undefined) {
            allPoints[schoolId] = (allPoints[schoolId] || 0) + points;
          }
        }
      });

      // Store event-specific points
      const eventPoints = schools
        .map(school => ({
          id: school.id,
          name: school.name,
          points: allPoints[school.id] || 0
        }))
        .filter(school => school.points > 0)
        .sort((a, b) => b.points - a.points);

      allEventPoints[event.id] = eventPoints;
    });

    // Convert to array and sort by total points
    const sortedPoints = schools
      .map(school => ({
        id: school.id,
        name: school.name,
        points: allPoints[school.id] || 0
      }))
      .filter(school => school.points > 0)
      .sort((a, b) => b.points - a.points);

    setTeamPoints(sortedPoints);
  }, [finalPositions, schools, athletes, heats, trackEvents]);

  // Update finalists whenever heats or selected event changes
  useEffect(() => {
    if (!selectedEvent) {
      setFinalists([]);
      return;
    }

    const selectedEventDetails = trackEvents.find(e => e.id === selectedEvent);
    if (!selectedEventDetails) return;

    const eventHeats = heats.filter(heat => heat.eventId === selectedEvent);
    const allLanes = eventHeats.flatMap(heat => heat.lanes);
    
    // Get top 8 athletes/teams from heats
    const topEntries = allLanes
      .filter(lane => lane.position !== undefined)
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .slice(0, 8)
      .map((lane, index) => {
        if (selectedEventDetails.type === 'relay') {
          // For relay events, use school information
          const school = schools.find(s => s.id === lane.athleteId);
          return {
            ...lane,
            finalLane: laneAssignmentOrder[index],
            finalPosition: finalPositions[`${selectedEvent}-${lane.athleteId}`],
            name: school?.name || '',
            school: school?.name || ''
          };
        } else {
          // For individual events, use athlete information
          const athlete = athletes.find(a => a.id === lane.athleteId);
          const school = schools.find(s => s.id === athlete?.schoolId);
          return {
            ...lane,
            finalLane: laneAssignmentOrder[index],
            finalPosition: finalPositions[`${selectedEvent}-${lane.athleteId}`],
            name: athlete?.name || '',
            school: school?.name || ''
          };
        }
      });

    // Sort by final position if available, otherwise by lane
    const sortedEntries = topEntries.sort((a, b) => {
      if (a.finalPosition && b.finalPosition) {
        return a.finalPosition - b.finalPosition;
      }
      if (a.finalPosition) return -1;
      if (b.finalPosition) return 1;
      return a.finalLane - b.finalLane;
    });

    setFinalists(sortedEntries);
  }, [selectedEvent, heats, finalPositions, athletes, schools, trackEvents]);

  const handlePositionChange = (eventId: string, athleteId: string, position?: number) => {
    setFinalPositions(prev => ({
      ...prev,
      [`${eventId}-${athleteId}`]: position
    }));
  };

  const getPositionStyle = (position?: number) => {
    if (!position) return '';
    switch (position) {
      case 1:
        return 'bg-yellow-50';
      case 2:
        return 'bg-gray-50';
      case 3:
        return 'bg-orange-50';
      default:
        return '';
    }
  };

  const getMedalIcon = (position?: number) => {
    if (!position || position > 3) return null;
    const medalColors = {
      1: 'text-yellow-500',
      2: 'text-gray-400',
      3: 'text-orange-500'
    };
    return <Medal className={`w-5 h-5 mr-2 ${medalColors[position as keyof typeof medalColors]}`} />;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, athleteId: string, currentIndex: number) => {
    if (!selectedEvent) return;

    // Handle number keys 1-8 for position
    if (e.key >= '1' && e.key <= '8') {
      e.preventDefault();
      handlePositionChange(selectedEvent, athleteId, parseInt(e.key));
      return;
    }

    // Handle navigation
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          const prevAthlete = finalists[currentIndex - 1];
          setEditingPosition({
            athleteId: prevAthlete.athleteId,
            position: prevAthlete.finalPosition
          });
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < finalists.length - 1) {
          const nextAthlete = finalists[currentIndex + 1];
          setEditingPosition({
            athleteId: nextAthlete.athleteId,
            position: nextAthlete.finalPosition
          });
        }
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        handlePositionChange(selectedEvent, athleteId, undefined);
        break;
    }
  };

  const selectedEventDetails = formattedEvents.find(event => event.id === selectedEvent);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Events List */}
      <div className="w-1/4 border-r bg-white p-4 overflow-y-auto">
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => {
                setActiveTab('individual');
                setSelectedEvent(null);
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'individual'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Individual Events
            </button>
            <button
              onClick={() => {
                setActiveTab('relay');
                setSelectedEvent(null);
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'relay'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Relay Events
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {formattedEvents.map(event => (
            <div
              key={event.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedEvent === event.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedEvent(event.id)}
            >
              <span>{event.displayName}</span>
            </div>
          ))}
        </div>

        {/* Team Points Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Team Points</h3>
          {teamPoints.map((team, index) => (
            <div
              key={team.id}
              className={`p-3 rounded-lg mb-2 ${getPositionStyle(index + 1)}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {getMedalIcon(index + 1)}
                  <span>{team.name}</span>
                </div>
                <span className="font-bold">{team.points} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Finals Display */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedEvent && finalists.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold">
                {selectedEventDetails ? formatEventName(selectedEventDetails) : ''}
              </h2>
              <p className="text-blue-100 mt-2 text-sm">
                Use number keys (1-8) to set positions, arrow keys to navigate, Delete/Backspace to clear
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lane</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'relay' ? 'School' : 'Name'}
                    </th>
                    {activeTab === 'individual' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {finalists.map((lane, index) => {
                    const isEditing = editingPosition?.athleteId === lane.athleteId;
                    
                    return (
                      <tr
                        key={`${selectedEvent}-${lane.athleteId}-${lane.finalLane}`}
                        className={`${getPositionStyle(lane.finalPosition)} ${isEditing ? 'ring-2 ring-blue-500' : ''}`}
                        tabIndex={0}
                        onKeyDown={(e) => handleKeyDown(e, lane.athleteId, index)}
                        onClick={() => {
                          if (!isEditing) {
                            setEditingPosition({
                              athleteId: lane.athleteId,
                              position: lane.finalPosition
                            });
                          }
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {lane.finalLane}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{lane.name}</div>
                        </td>
                        {activeTab === 'individual' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{lane.school}</div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center min-w-[60px]">
                              {getMedalIcon(lane.finalPosition)}
                              <span>{lane.finalPosition || '-'}</span>
                            </div>
                            {lane.finalPosition && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePositionChange(selectedEvent, lane.athleteId, undefined);
                                }}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Trophy className="w-12 h-12 mb-2" />
            <p>{selectedEvent ? 'No finals data available for this event' : 'Select an event to view finals'}</p>
          </div>
        )}
      </div>
    </div>
  );
}