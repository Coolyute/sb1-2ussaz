import React, { createContext, useContext, ReactNode } from 'react';
import { School, Athlete, Meet, TrackEvent, Heat, RelayTeam } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateRelayEvents } from '../utils/relayUtils';

interface DataContextType {
  schools: School[];
  setSchools: (schools: School[]) => void;
  athletes: Athlete[];
  setAthletes: (athletes: Athlete[]) => void;
  meets: Meet[];
  setMeets: (meets: Meet[]) => void;
  trackEvents: TrackEvent[];
  setTrackEvents: (events: TrackEvent[]) => void;
  heats: Heat[];
  setHeats: (heats: Heat[]) => void;
  relayTeams: RelayTeam[];
  setRelayTeams: (teams: RelayTeam[]) => void;
  initializeRelayEvents: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useLocalStorage<School[]>('schools', []);
  const [athletes, setAthletes] = useLocalStorage<Athlete[]>('athletes', []);
  const [meets, setMeets] = useLocalStorage<Meet[]>('meets', []);
  const [trackEvents, setTrackEvents] = useLocalStorage<TrackEvent[]>('trackEvents', []);
  const [heats, setHeats] = useLocalStorage<Heat[]>('heats', []);
  const [relayTeams, setRelayTeams] = useLocalStorage<RelayTeam[]>('relayTeams', []);

  const initializeRelayEvents = () => {
    const relayEvents = generateRelayEvents();
    setTrackEvents(prev => {
      const existingEvents = prev.filter(e => e.type !== 'relay');
      return [...existingEvents, ...relayEvents];
    });
  };

  return (
    <DataContext.Provider value={{
      schools,
      setSchools,
      athletes,
      setAthletes,
      meets,
      setMeets,
      trackEvents,
      setTrackEvents,
      heats,
      setHeats,
      relayTeams,
      setRelayTeams,
      initializeRelayEvents,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}