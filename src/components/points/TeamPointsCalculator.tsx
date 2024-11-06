import { School, Athlete, TrackEvent } from '../../types';

interface PointsResult {
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

export function calculateTeamPoints(
  schools: School[],
  athletes: Athlete[],
  trackEvents: TrackEvent[],
  finalPositions: Record<string, number>
): PointsResult[] {
  // Points system for individual events
  const individualPointsMap: Record<number, number> = {
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
  const relayPointsMap: Record<number, number> = {
    1: 12, // Gold
    2: 10, // Silver
    3: 8,  // Bronze
    4: 6,
    5: 5,
    6: 4,
    7: 3,
    8: 2
  };

  // Initialize points data structure for each school
  const schoolPoints: Record<string, PointsResult> = {};
  
  schools.forEach(school => {
    schoolPoints[school.id] = {
      schoolId: school.id,
      schoolName: school.name,
      totalPoints: 0,
      breakdown: []
    };
  });

  // Process all final positions
  Object.entries(finalPositions).forEach(([key, position]) => {
    if (!position) return;

    const [eventId, participantId] = key.split('-');
    const event = trackEvents.find(e => e.id === eventId);
    if (!event) return;

    if (event.type === 'relay') {
      // For relay events, participantId is the school ID
      const points = relayPointsMap[position] || 0;
      if (schoolPoints[participantId]) {
        schoolPoints[participantId].totalPoints += points;
        schoolPoints[participantId].breakdown.push({
          eventName: `${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} ${event.name}`,
          position,
          points,
          type: 'relay'
        });
      }
    } else {
      // For individual events
      const athlete = athletes.find(a => a.id === participantId);
      if (athlete && schoolPoints[athlete.schoolId]) {
        const points = individualPointsMap[position] || 0;
        schoolPoints[athlete.schoolId].totalPoints += points;
        schoolPoints[athlete.schoolId].breakdown.push({
          eventName: `${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} ${event.name}`,
          athleteName: athlete.name,
          position,
          points,
          type: 'individual'
        });
      }
    }
  });

  // Convert to array and sort by total points
  return Object.values(schoolPoints)
    .filter(school => school.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);
}