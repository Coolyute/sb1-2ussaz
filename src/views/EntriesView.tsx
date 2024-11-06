import React, { useState, useRef } from 'react';
import { Search, Plus, Trash2, Upload, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import { normalizeSchoolName, findMatchingSchool } from '../utils/schoolUtils';
import { parseAgeCategory } from '../utils/categoryUtils';
import { formatExcelDate } from '../utils/dateUtils';
import { parseEvents } from '../utils/eventUtils';
import * as XLSX from 'xlsx';

export function EntriesView() {
  const { athletes, schools, trackEvents, setAthletes, setTrackEvents } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'individual' | 'relay'>('individual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createEventIfNotExists = (eventName: string, gender: 'M' | 'F', ageCategory: string) => {
    // Check if event already exists with exact name, gender, and age group
    const existingEvent = trackEvents.find(e => 
      e.name === eventName && 
      e.gender === gender && 
      e.ageGroup === ageCategory
    );

    if (!existingEvent) {
      // Determine event type based on name
      const isRelay = eventName.toLowerCase().includes('relay');
      
      const newEvent = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        name: eventName,
        type: isRelay ? 'relay' : 'track', // Default to track for non-relay events
        gender,
        ageGroup: ageCategory as 'U9' | 'U11' | 'U13' | 'U15' | 'Open'
      };

      setTrackEvents(prev => [...prev, newEvent]);
    }
  };

  // Generate individual entries
  const individualEntries = athletes.flatMap(athlete => 
    athlete.events
      .filter(eventName => {
        const event = trackEvents.find(e => e.name === eventName);
        return event && event.type !== 'relay';
      })
      .map((eventName, index) => ({
        id: `${athlete.id}-${eventName}-${index}`,
        athleteName: athlete.name,
        school: schools.find(s => s.id === athlete.schoolId)?.name || '',
        gender: athlete.gender,
        dateOfBirth: athlete.dateOfBirth,
        ageCategory: athlete.ageCategory,
        event: eventName,
        athleteId: athlete.id
      }))
  );

  // Generate relay entries
  const relayEntries = trackEvents
    .filter(event => event.type === 'relay')
    .flatMap(event => 
      schools.map(school => ({
        id: `relay-${school.id}-${event.id}`,
        school: school.name,
        gender: event.gender === 'M' ? 'Boys' : 'Girls',
        ageGroup: event.ageGroup,
        event: event.name,
        schoolId: school.id,
        eventId: event.id
      }))
    );

  const entries = activeTab === 'individual' ? individualEntries : relayEntries;

  const filteredEntries = entries.filter(entry =>
    entry.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (activeTab === 'individual' && 'athleteName' in entry && entry.athleteName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          let failedCount = 0;
          let newAthletes = [...athletes];

          jsonData.forEach((row: any) => {
            try {
              const school = findMatchingSchool(row.Team, schools);
              if (!school) {
                console.warn(`School not found: ${row.Team}`);
                failedCount++;
                return;
              }

              let dateOfBirth;
              try {
                dateOfBirth = formatExcelDate(row.DOB);
              } catch (error) {
                console.warn(`Invalid date format for ${row.Name}`);
                failedCount++;
                return;
              }

              const gender = row.Gender.toLowerCase().startsWith('m') ? 'M' : 'F';
              const ageCategory = parseAgeCategory(row['Age Category']);
              const events = parseEvents(row.Event);

              if (events.length === 0) {
                console.warn(`No valid events found for ${row.Name}`);
                failedCount++;
                return;
              }

              // Create events if they don't exist
              events.forEach(eventName => {
                createEventIfNotExists(eventName, gender, ageCategory);
              });

              let athlete = newAthletes.find(a => 
                a.name.toLowerCase() === row.Name.toLowerCase().trim() && 
                a.schoolId === school.id
              );

              if (!athlete) {
                athlete = {
                  id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${school.id}`,
                  name: row.Name.trim(),
                  schoolId: school.id,
                  gender,
                  dateOfBirth,
                  ageCategory,
                  events: events,
                  personalBests: {}
                };
                newAthletes.push(athlete);
                successCount += events.length;
              } else {
                const athleteIndex = newAthletes.findIndex(a => a.id === athlete!.id);
                const newEvents = [...new Set([...athlete.events, ...events])];
                newAthletes[athleteIndex] = {
                  ...athlete,
                  events: newEvents
                };
                successCount += events.length - athlete.events.length;
              }
            } catch (error) {
              console.warn(`Error processing row:`, error);
              failedCount++;
            }
          });

          setAthletes(newAthletes);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          alert(`Import completed!\nSuccessful entries: ${successCount}\nFailed entries: ${failedCount}`);
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error importing data. Please check the file format and try again.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExport = () => {
    const exportData = entries.map(entry => ({
      Name: activeTab === 'individual' && 'athleteName' in entry ? entry.athleteName : '',
      School: entry.school,
      Gender: entry.gender,
      'Age Category': activeTab === 'individual' ? entry.ageCategory : entry.ageGroup,
      Event: entry.event
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Entries');
    XLSX.writeFile(wb, 'event_entries.xlsx');
  };

  const handleRemoveEntry = (entryId: string) => {
    if (activeTab === 'individual') {
      const [athleteId, eventName] = entryId.split('-');
      setAthletes(prevAthletes => prevAthletes.map(athlete => {
        if (athlete.id === athleteId) {
          return {
            ...athlete,
            events: athlete.events.filter(e => e !== eventName)
          };
        }
        return athlete;
      }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Event Entries</h2>
          <p className="text-gray-600 mt-2">Manage event registrations</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-4 py-2 ${
                activeTab === 'individual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Individual Events
            </button>
            <button
              onClick={() => setActiveTab('relay')}
              className={`px-4 py-2 ${
                activeTab === 'relay'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Relay Events
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entries..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {activeTab === 'individual' && (
            <>
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
            </>
          )}

          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {activeTab === 'individual' ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                </>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.map((entry: any) => (
              <tr key={entry.id}>
                {activeTab === 'individual' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{entry.athleteName}</div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.school}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.gender}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {activeTab === 'individual' ? entry.ageCategory : entry.ageGroup}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{entry.event}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {activeTab === 'individual' && (
                    <button
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}