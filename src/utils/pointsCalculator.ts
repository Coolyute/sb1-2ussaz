export const calculateTeamPoints = (
  finalPositions: Record<string, number>,
  athletes: any[],
  schools: any[],
  trackEvents: any[]
) => {
  // Points system for individual events
  const individualPointsMap: Record<number, number> = {
    1: 9, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
  };

  // Points system for relay events
  const relayPointsMap: Record<number, number> = {
    1: 12, 2: 10, 3: 8, 4: 6, 5: 5, 6: 4, 7: 3, 8: 2
  };

  const teamPoints: Record<string, number> = {};

  // Initialize points for all schools
  schools.forEach(school => {
    teamPoints[school.id] = 0;
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
      teamPoints[participantId] = (teamPoints[participantId] || 0) + pointsValue;
    } else {
      // For individual events, look up the athlete's school
      const athlete = athletes.find(a => a.id === participantId);
      if (athlete) {
        const pointsValue = individualPointsMap[position] || 0;
        teamPoints[athlete.schoolId] = (teamPoints[athlete.schoolId] || 0) + pointsValue;
      }
    }
  });

  // Convert to array and sort by points
  return schools
    .map(school => ({
      id: school.id,
      name: school.name,
      points: teamPoints[school.id] || 0
    }))
    .filter(school => school.points > 0)
    .sort((a, b) => b.points - a.points);
};