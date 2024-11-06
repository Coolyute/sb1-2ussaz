import React from 'react';
import { X, UserMinus } from 'lucide-react';
import { Athlete, School } from '../types';

interface HeatLaneProps {
  lane: {
    lane: number;
    athleteId: string;
    position?: number;
  };
  participant: (Athlete | School) | undefined;
  team: School | undefined;
  isEditing: boolean;
  onPositionChange: (position: number | undefined) => void;
  onRemoveAthlete: () => void;
  onLaneClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => void;
  isRelay?: boolean;
}

export function HeatLane({
  lane,
  participant,
  team,
  isEditing,
  onPositionChange,
  onRemoveAthlete,
  onLaneClick,
  onKeyDown,
  isRelay = false
}: HeatLaneProps) {
  return (
    <tr
      className={`${isEditing ? 'ring-2 ring-blue-500' : ''} hover:bg-gray-50`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={onLaneClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-900">
            {lane.lane}
          </span>
        </div>
      </td>
      {!isRelay && (
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">
            {'name' in (participant || {}) ? participant?.name : ''}
          </div>
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {isRelay ? participant?.name : team?.name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <div className="flex items-center min-w-[60px]">
            <span>{lane.position || '-'}</span>
          </div>
          {lane.position && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPositionChange(undefined);
              }}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveAthlete();
          }}
          className="text-red-400 hover:text-red-600"
          title={`Remove ${isRelay ? 'school' : 'athlete'}`}
        >
          <UserMinus className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}