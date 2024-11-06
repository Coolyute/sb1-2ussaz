import React from 'react';
import { useData } from '../context/DataContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function FinalistsList() {
  const { athletes, schools, trackEvents } = useData();
  const [heats] = useLocalStorage('heats', []);
  const [finalPositions] = useLocalStorage('finalPositions', {});

  // Lane assignment order for finals
  const laneAssignmentOrder = [4, 5, 3, 6, 7, 2, 8, 1];

  // Get all finalists across events
  const finalistsByEvent = trackEvents.map(event => {
    const eventHeats = heats.filter(heat => heat.eventId === event.id);
    const allLanes = eventHeats.flatMap(heat => heat.lanes);
    
    // Get top 8 athletes from heats
    const finalists = allLanes
      .filter(lane => lane.position !== undefined)
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .slice(0, 8)
      .map((lane, index) => {
        const athlete = athletes.find(a => a.id === lane.athleteId);
        const school = schools.find(s => s.id === athlete?.schoolId);
        const finalPosition = finalPositions[`${event.id}-${lane.athleteId}`];
        
        return {
          lane: laneAssignmentOrder[index], // Use the final lane assignment
          name: athlete?.name || '',
          school: school?.name || '',
          finalPosition
        };
      })
      .sort((a, b) => {
        if (a.finalPosition && b.finalPosition) {
          return a.finalPosition - b.finalPosition;
        }
        if (a.finalPosition) return -1;
        if (b.finalPosition) return 1;
        return a.lane - b.lane;
      });

    return {
      eventName: `${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} - ${event.name}`,
      finalists
    };
  }).filter(event => event.finalists.length > 0);

  if (finalistsByEvent.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No finalists data available
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 2cm; }
          @media print {
            body { font-size: 12pt; }
            .page-break { page-break-before: always; }
          }
        `}
      </style>

      <h1 className="text-2xl font-bold mb-6 text-center print:text-xl">Finals List</h1>
      
      <div className="space-y-8">
        {finalistsByEvent.map((event, index) => (
          <div key={event.eventName} className={index > 0 ? 'page-break' : ''}>
            <h2 className="text-xl font-semibold mb-4 print:text-lg">{event.eventName}</h2>
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Lane</th>
                  <th className="py-2 text-left">Name</th>
                  <th className="py-2 text-left">School</th>
                </tr>
              </thead>
              <tbody>
                {event.finalists
                  .sort((a, b) => a.lane - b.lane) // Sort by lane number for the printed list
                  .map((finalist, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{finalist.lane}</td>
                      <td className="py-2">{finalist.name}</td>
                      <td className="py-2">{finalist.school}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}