import { TrackEvent } from '../types';

export function generateRelayEvents(): TrackEvent[] {
  const ageGroups: ('U9' | 'U11' | 'U13' | 'U15' | 'Open')[] = ['U9', 'U11', 'U13', 'U15', 'Open'];
  const genders: ('M' | 'F')[] = ['M', 'F'];
  const events: TrackEvent[] = [];

  // Generate 4x100m relay events for all age groups and genders
  for (const ageGroup of ageGroups) {
    for (const gender of genders) {
      events.push({
        id: `4x100-${gender}-${ageGroup}-${Date.now()}`,
        name: '4x100m Relay',
        type: 'relay',
        gender,
        ageGroup,
        relayType: '4x100'
      });
    }
  }

  // Generate medley relay events for U13 and above
  for (const ageGroup of ageGroups.filter(age => ['U13', 'U15', 'Open'].includes(age))) {
    for (const gender of genders) {
      events.push({
        id: `medley-${gender}-${ageGroup}-${Date.now()}`,
        name: 'Medley Relay',
        type: 'relay',
        gender,
        ageGroup,
        relayType: 'medley'
      });
    }
  }

  return events;
}