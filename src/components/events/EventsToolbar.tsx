import React, { useRef } from 'react';
import { Plus, Search, Upload, Download } from 'lucide-react';

interface EventsToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onAdd: () => void;
}

export function EventsToolbar({
  searchTerm,
  onSearchChange,
  onImport,
  onExport,
  onAdd
}: EventsToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Events</h2>
        <p className="text-gray-600 mt-2">Manage track and field events</p>
      </div>
      
      <div className="flex space-x-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImport}
          accept=".xlsx,.xls"
          className="hidden"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-5 h-5 mr-2" />
          Import Excel
        </button>
        <button 
          onClick={onExport}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Excel
        </button>
        <button 
          onClick={onAdd}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Event
        </button>
      </div>
    </div>
  );
}