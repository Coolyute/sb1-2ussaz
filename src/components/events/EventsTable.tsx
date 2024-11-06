import React from 'react';
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { TrackEvent } from '../../types';

interface EventsTableProps {
  events: TrackEvent[];
  sortField: 'name' | 'type' | 'gender' | 'ageGroup' | 'entries';
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'name' | 'type' | 'gender' | 'ageGroup' | 'entries') => void;
  onEdit: (event: TrackEvent) => void;
  onDelete: (id: string) => void;
  getEntriesCount: (event: TrackEvent) => number;
}

export function EventsTable({
  events,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  getEntriesCount
}: EventsTableProps) {
  const getSortIcon = (field: typeof sortField) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center">
                Event Name
                {getSortIcon('name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('type')}
            >
              <div className="flex items-center">
                Type
                {getSortIcon('type')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('gender')}
            >
              <div className="flex items-center">
                Gender
                {getSortIcon('gender')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('ageGroup')}
            >
              <div className="flex items-center">
                Age Group
                {getSortIcon('ageGroup')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSort('entries')}
            >
              <div className="flex items-center">
                Entries
                {getSortIcon('entries')}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.map(event => (
            <tr key={event.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{event.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  event.type === 'track' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'field' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {event.gender === 'M' ? 'Boys' : 'Girls'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{event.ageGroup}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {getEntriesCount(event)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(event)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(event.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}