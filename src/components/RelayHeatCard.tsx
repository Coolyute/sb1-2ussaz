import React from 'react';
import { UserPlus } from 'lucide-react';
import { RelayTeam, School, Athlete } from '../types';

interface RelayHeatCardProps {
  heat: {
    id: string;
    heatNumber: number;
    lanes: Array<{
      lane: number;
      relayTeamId?: string;
      position?: number;
    }>;
  };
  relayTeams: RelayTeam[];
  schools: School[];
  athletes: Athlete[];
  onAddTeam: (heatId: string) => void;
  onRemoveTeam: (heatId: string, teamId: string) => void;
  onPositionChange: (heatId: string, teamId: string, position?: number) => void;
}

export function RelayHeatCard({
  heat,
  relayTeams,
  schools,
  athletes,
  onAddTeam,
  onRemoveTeam,
  onPositionChange
}: RelayHeatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Heat {heat.heatNumber}</h3>
        <button
          onClick={() => onAddTeam(heat.id)}
          className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Team
        </button>
      </div>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lane</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Athletes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {heat.lanes.map((lane) => {
            const team = lane.relayTeamId ? relayTeams.find(t => t.id === lane.relayTeamId) : undefined;
            const school = team ? schools.find(s => s.id === team.schoolId) : undefined;
            
            return (
              <tr key={`${heat.id}-${lane.lane}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{lane.lane}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{school?.name || '-'}</span>
                </td>
                <td className="px-6 py-4">
                  {team && (
                    <div className="text-sm text-gray-500">
                      {team.athletes
                        .sort((a, b) => a.position - b.position)
                        .map((member) => {
                          const athlete = athletes.find(a => a.id === member.athleteId);
                          return athlete?.name;
                        })
                        .join(' → ')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{lane.position || '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {team && (
                    <button
                      onClick={() => onRemoveTeam(heat.id, team.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}