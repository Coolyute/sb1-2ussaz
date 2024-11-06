import React from 'react';
import { UserPlus } from 'lucide-react';
import { HeatLane } from './HeatLane';
import { Athlete, School } from '../types';

interface HeatCardProps {
  heat: {
    id: string;
    heatNumber: number;
    lanes: Array<{
      lane: number;
      athleteId: string;
      position?: number;
    }>;
  };
  athletes: Athlete[];
  schools: School[];
  editingPosition: {
    heatId: string;
    athleteId: string;
    position?: number;
  } | null;
  onPositionChange: (heatId: string, athleteId: string, position?: number) => void;
  onRemoveAthlete: (heatId: string, athleteId: string) => void;
  onAddAthlete: (heatId: string) => void;
  onLaneClick: (heatId: string, athleteId: string, position?: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>, athleteId: string, index: number) => void;
  isRelay?: boolean;
}

export function HeatCard({
  heat,
  athletes,
  schools,
  editingPosition,
  onPositionChange,
  onRemoveAthlete,
  onAddAthlete,
  onLaneClick,
  onKeyDown,
  isRelay = false
}: HeatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Heat {heat.heatNumber}</h3>
        <button
          onClick={() => onAddAthlete(heat.id)}
          className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add {isRelay ? 'School' : 'Athlete'}
        </button>
      </div>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lane</th>
            {!isRelay && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isRelay ? 'School' : 'Team'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {heat.lanes.map((lane, index) => {
            let participant;
            let team;

            if (isRelay) {
              // For relay events, athleteId contains schoolId
              team = schools.find(s => s.id === lane.athleteId);
              participant = team;
            } else {
              participant = athletes.find(a => a.id === lane.athleteId);
              team = participant ? schools.find(s => s.id === participant.schoolId) : undefined;
            }

            const isEditing = editingPosition?.heatId === heat.id && 
                            editingPosition?.athleteId === lane.athleteId;

            return (
              <HeatLane
                key={`${heat.id}-${lane.lane}-${lane.athleteId}`}
                lane={lane}
                participant={participant}
                team={team}
                isEditing={isEditing}
                onPositionChange={(position) => onPositionChange(heat.id, lane.athleteId, position)}
                onRemoveAthlete={() => onRemoveAthlete(heat.id, lane.athleteId)}
                onLaneClick={() => onLaneClick(heat.id, lane.athleteId, lane.position)}
                onKeyDown={(e) => onKeyDown(e, lane.athleteId, index)}
                isRelay={isRelay}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}