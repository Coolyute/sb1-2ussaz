import { School, Meet, Athlete } from '../types';

export interface RelayTeam {
  id: string;
  schoolId: string;
  eventId: string;
  ageGroup: 'U9' | 'U11' | 'U13' | 'U15' | 'Open';
  gender: 'M' | 'F';
  athletes: {
    athleteId: string;
    position: number; // 1-4 representing running order
  }[];
}

export interface School {
  id: string;
  name: string;
}

export interface Athlete {
  id: string;
  name: string;
  dateOfBirth: string;
  ageCategory: 'U9' | 'U11' | 'U13' | 'U15' | 'Open';
  schoolId: string;
  events: string[];
  personalBests: Record<string, number>;
  gender: 'M' | 'F';
}

export interface TrackEvent {
  id: string;
  name: string;
  type: 'track' | 'field' | 'relay';
  gender: 'M' | 'F';
  ageGroup: 'U9' | 'U11' | 'U13' | 'U15' | 'Open';
  relayType?: '4x100' | 'medley'; // Only for relay events
}

export interface Meet {
  id: string;
  name: string;
  type: 'track' | 'field' | 'relay';
  gender: 'M' | 'F' | 'mixed';
  startTime: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: string[];
  results: Record<string, number>;
  maxParticipantsPerSchool: number;
  eventId: string;
}

export interface Heat {
  id: string;
  eventId: string;
  heatNumber: number;
  lanes: Array<{
    lane: number;
    athleteId?: string; // Optional for individual events
    relayTeamId?: string; // Optional for relay events
    position?: number;
  }>;
  status: 'pending' | 'completed';
  results?: Record<string, number>;
}