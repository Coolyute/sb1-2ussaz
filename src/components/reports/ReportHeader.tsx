import React from 'react';
import { Printer } from 'lucide-react';

interface ReportHeaderProps {
  selectedReport: string;
  onReportChange: (report: string) => void;
  onPrint: () => void;
}

export function ReportHeader({ selectedReport, onReportChange, onPrint }: ReportHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Reports</h2>
        <p className="text-gray-600 mt-2">Generate and print event reports</p>
      </div>

      <div className="flex space-x-4">
        <select
          value={selectedReport}
          onChange={(e) => onReportChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="heats">Heats Report</option>
          <option value="finals">Finals List</option>
          <option value="schoolFinalists">School Finalists</option>
          <option value="teamPoints">Team Points</option>
        </select>
        <button
          onClick={onPrint}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Printer className="w-5 h-5 mr-2" />
          Print Report
        </button>
      </div>
    </div>
  );
}