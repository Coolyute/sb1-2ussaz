import React from 'react';
import { TeamPointsTable } from '../components/shared/TeamPointsTable';

export function TeamPointsView() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Team Points</h2>
        <p className="text-gray-600 mt-2">Overall team rankings and points breakdown</p>
      </div>
      
      <TeamPointsTable variant="full" />
    </div>
  );
}