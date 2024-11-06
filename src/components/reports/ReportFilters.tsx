import React from 'react';
import { Filter } from 'lucide-react';
import { School, TrackEvent } from '../../types';

interface Filters {
  ageGroup: string;
  gender: string;
  school: string;
  event: string;
}

interface ReportFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  schools: School[];
  trackEvents: TrackEvent[];
}

export function ReportFilters({ filters, onFilterChange, schools, trackEvents }: ReportFiltersProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Filter className="w-5 h-5 mr-2" />
        Filters
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
          <select
            value={filters.ageGroup}
            onChange={(e) => onFilterChange({ ...filters, ageGroup: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Age Groups</option>
            <option value="U9">Under 9</option>
            <option value="U11">Under 11</option>
            <option value="U13">Under 13</option>
            <option value="U15">Under 15</option>
            <option value="Open">Open</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange({ ...filters, gender: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Genders</option>
            <option value="M">Boys</option>
            <option value="F">Girls</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
          <select
            value={filters.school}
            onChange={(e) => onFilterChange({ ...filters, school: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Schools</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
          <select
            value={filters.event}
            onChange={(e) => onFilterChange({ ...filters, event: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            {trackEvents.map(event => (
              <option key={event.id} value={event.name}>{event.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}