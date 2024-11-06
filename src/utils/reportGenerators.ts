// Previous imports remain the same...

export const generateHeatsReport = (
  heats: any[],
  trackEvents: TrackEvent[],
  athletes: Athlete[],
  schools: School[],
  filters: {
    ageGroup: string;
    gender: string;
    school: string;
    event: string;
  },
  reportType: 'individual' | 'relay'
) => {
  const reportData = [];
  
  for (const heat of heats) {
    const event = trackEvents.find(e => e.id === heat.eventId);
    if (!event) continue;
    
    // Filter by event type
    if (reportType === 'relay' ? event.type !== 'relay' : event.type === 'relay') continue;

    // Apply filters
    if (filters.ageGroup !== 'all' && event.ageGroup !== filters.ageGroup) continue;
    if (filters.gender !== 'all' && event.gender !== filters.gender) continue;
    if (filters.event !== 'all' && event.name !== filters.event) continue;

    const formattedHeat = {
      event: event.name,
      gender: event.gender === 'M' ? 'Boys' : 'Girls',
      ageGroup: event.ageGroup,
      heatNumber: heat.heatNumber,
      lanes: heat.lanes.map(lane => {
        if (reportType === 'relay') {
          const school = schools.find(s => s.id === lane.athleteId);
          if (filters.school !== 'all' && school?.id !== filters.school) return null;
          return {
            lane: lane.lane,
            name: school?.name || '',
          };
        } else {
          const athlete = athletes.find(a => a.id === lane.athleteId);
          const school = schools.find(s => s.id === athlete?.schoolId);
          if (filters.school !== 'all' && school?.id !== filters.school) return null;
          return {
            lane: lane.lane,
            name: athlete?.name || '',
            school: school?.name || ''
          };
        }
      }).filter(Boolean)
    };

    if (formattedHeat.lanes.length > 0) {
      reportData.push(formattedHeat);
    }
  }

  return reportData;
};

// Previous generateFinalsReport function remains the same...

export const generateSchoolFinalistsReport = (
  heats: any[],
  trackEvents: TrackEvent[],
  athletes: Athlete[],
  schools: School[],
  finalPositions: Record<string, number>
) => {
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