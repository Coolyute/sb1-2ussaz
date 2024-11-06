import React, { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, Upload, Download } from 'lucide-react';
import { School } from '../types';
import { useData } from '../context/DataContext';
import * as XLSX from 'xlsx';

export function TeamsView() {
  const { schools, setSchools } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTeam, setNewTeam] = useState({
    name: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeam) {
      setSchools(schools.map(school => 
        school.id === editingTeam.id 
          ? { ...editingTeam, ...newTeam }
          : school
      ));
    } else {
      const school: School = {
        id: Date.now().toString(),
        ...newTeam
      };
      setSchools([...schools, school]);
    }
    setShowForm(false);
    setEditingTeam(null);
    setNewTeam({ name: '' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let successCount = 0;
          let errorCount = 0;

          // Process each row
          const newSchools = jsonData.map((row: any) => {
            // Try different possible column names, prioritizing "Team"
            const teamName = row.Team || row.team || row.TEAM;
            
            if (!teamName) {
              errorCount++;
              return null;
            }

            const trimmedName = teamName.toString().trim();
            
            // Check if school already exists (case-insensitive)
            const exists = schools.some(s => 
              s.name.toLowerCase() === trimmedName.toLowerCase()
            );

            if (exists) {
              errorCount++;
              return null;
            }

            successCount++;
            return {
              id: Date.now().toString() + '-' + Math.random().toString(36).substring(2),
              name: trimmedName
            };
          }).filter(Boolean) as School[];

          // Add new schools
          setSchools(prev => [...prev, ...newSchools]);

          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          alert(`Import completed!\nSuccessful entries: ${successCount}\nFailed entries: ${errorCount}`);
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error importing data. Please check the file format and try again.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExport = () => {
    const exportData = schools.map(school => ({
      Team: school.name
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teams');
    XLSX.writeFile(wb, 'teams.xlsx');
  };

  const handleEdit = (school: School) => {
    setEditingTeam(school);
    setNewTeam({ name: school.name });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      setSchools(schools.filter(school => school.id !== id));
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Teams</h2>
          <p className="text-gray-600 mt-2">Manage participating teams</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search teams..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
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
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Excel
          </button>
          <button 
            onClick={() => {
              setEditingTeam(null);
              setNewTeam({ name: '' });
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Team
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingTeam ? 'Edit Team' : 'Add New Team'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingTeam ? 'Save Changes' : 'Add Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSchools.map(school => (
              <tr key={school.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{school.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(school)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(school.id)}
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
    </div>
  );
}