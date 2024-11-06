import React from 'react';
import { Medal } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { laneAssignmentOrder } from '../../utils/laneUtils';

export function SchoolFinalistsReport() {
  const { schools, athletes, trackEvents } = useData();
  const [heats] = useLocalStorage('heats', []);
  const [finalPositions] = useLocalStorage('finalPositions', {});

  const generateSchoolFinalistsReport = () => {
    const schoolFinalists: Record<string, any[]> = {};
    
    // Initialize arrays for each school
    schools.forEach(school => {
      schoolFinalists[school.id] = [];
    });

    // Process all events
    trackEvents.forEach(event => {
      const eventHeats = heats.filter(heat => heat.eventId === event.id);
      const allLanes = eventHeats.flatMap(heat => heat.lanes);
      
      // Get finalists for this event
      allLanes
        .filter(lane => lane.position !== undefined)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .slice(0, 8)
        .forEach((lane, index) => {
          const lane_number = laneAssignmentOrder[index];
          const position = finalPositions[`${event.id}-${lane.athleteId}`];

          if (event.type === 'relay') {
            // Handle relay events
            const schoolId = lane.athleteId; // For relay events, athleteId is schoolId
            if (schoolFinalists[schoolId]) {
              schoolFinalists[schoolId].push({
                type: 'relay',
                eventName: event.name,
                ageGroup: event.ageGroup,
                gender: event.gender,
                lane: lane_number,
                position
              });
            }
          } else {
            // Handle individual events
            const athlete = athletes.find(a => a.id === lane.athleteId);
            if (athlete && schoolFinalists[athlete.schoolId]) {
              schoolFinalists[athlete.schoolId].push({
                type: 'individual',
                athleteName: athlete.name,
                eventName: event.name,
                ageGroup: event.ageGroup,
                gender: event.gender,
                lane: lane_number,
                position
              });
            }
          }
        });
    });

    // Convert to array and filter out schools with no finalists
    return schools
      .map(school => ({
        schoolName: school.name,
        finalists: schoolFinalists[school.id]
      }))
      .filter(school => school.finalists.length > 0);
  };

  const schoolFinalistsData = generateSchoolFinalistsReport();

  if (schoolFinalistsData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No school finalists data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {schoolFinalistsData.map((school) => (
        <div key={school.schoolName} className="bg-gray-50 rounded-lg p-4">
          <div className="font-semibold text-lg mb-2">{school.schoolName}</div>
          <table className="min-w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left py-2">Age Group</th>
                <th className="text-left py-2">Event</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Athlete</th>
                <th className="text-center py-2">Lane</th>
                <th className="text-center py-2">Position</th>
              </tr>
            </thead>
            <tbody>
              {school.finalists.map((finalist, i) => (
                <tr key={i} className="border-t border-gray-200">
                  <td className="py-2 text-left">{finalist.ageGroup}</td>
                  <td className="py-2 text-left">
                    {`${finalist.gender === 'M' ? 'Boys' : 'Girls'} ${finalist.eventName}`}
                  </td>
                  <td className="py-2 text-left capitalize">{finalist.type}</td>
                  <td className="py-2 text-left">
                    {finalist.type === 'relay' ? school.schoolName : finalist.athleteName}
                  </td>
                  <td className="py-2 text-center">{finalist.lane}</td>
                  <td className="py-2 text-center">
                    {finalist.position ? (
                      <span className={`inline-flex items-center ${
                        finalist.position <= 3 ? 'text-yellow-500' : 'text-gray-500'
                      }`}>
                        {finalist.position}
                        {finalist.position <= 3 && <Medal className="w-4 h-4 ml-1" />}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}