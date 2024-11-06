import React from 'react';

interface EventTypeToggleProps {
  reportType: 'individual' | 'relay';
  onTypeChange: (type: 'individual' | 'relay') => void;
}

export function EventTypeToggle({ reportType, onTypeChange }: EventTypeToggleProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-center mb-4">Heats</h3>
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => onTypeChange('individual')}
          className={`px-4 py-2 rounded-lg ${
            reportType === 'individual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Individual Events
        </button>
        <button
          onClick={() => onTypeChange('relay')}
          className={`px-4 py-2 rounded-lg ${
            reportType === 'relay'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Relay Events
        </button>
      </div>
    </div>
  );
}