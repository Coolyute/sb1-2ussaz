import React from 'react';
import { Users } from 'lucide-react';

export function EmptyHeatsState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <Users className="w-12 h-12 mb-2" />
      <p>Select an event and generate heats to get started</p>
    </div>
  );
}