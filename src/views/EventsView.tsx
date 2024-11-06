import React, { useState, useRef } from 'react';
import { Search, Plus, Pencil, Trash2, Upload, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import { normalizeSchoolName, findMatchingSchool } from '../utils/schoolUtils';
import { parseAgeCategory } from '../utils/categoryUtils';
import { formatExcelDate } from '../utils/dateUtils';
import { parseEvents } from '../utils/eventUtils';
import * as XLSX from 'xlsx';
import { EventsTable } from '../components/events/EventsTable';
import { EventForm } from '../components/events/EventForm';
import { EventsToolbar } from '../components/events/EventsToolbar';

export function EventsView() {
  const { athletes, schools, trackEvents, setTrackEvents } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'type' | 'gender' | 'ageGroup' | 'entries'>('ageGroup');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'track',
    gender: 'M',
    ageGroup: 'U9'
  });

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
          let newEvents = [];

          jsonData.forEach((row: any) => {
            try {
              const eventName = row.Event?.toString().trim();
              const gender = row.Gender?.toString().toLowerCase().startsWith('b') ? 'M' : 'F';
              const ageGroup = row['Age Group']?.toString().trim();
              const type = row.Type?.toString().toLowerCase();

              if (!eventName || !gender || !ageGroup || !type) {
                failedCount++;
                return;
              }

              if (!['U9', 'U11', 'U13', 'U15', 'Open'].includes(ageGroup)) {
                failedCount++;
                return;
              }

              if (!['track', 'field', 'relay'].includes(type)) {
                failedCount++;
                return;
              }

              const isDuplicate = trackEvents.some(e => 
                e.name.toLowerCase() === eventName.toLowerCase() && 
                e.gender === gender && 
                e.ageGroup === ageGroup
              ) || newEvents.some(e => 
                e.name.toLowerCase() === eventName.toLowerCase() && 
                e.gender === gender && 
                e.ageGroup === ageGroup
              );

              if (isDuplicate) {
                failedCount++;
                return;
              }

              newEvents.push({
                id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
                name: eventName,
                gender,
                ageGroup: ageGroup as 'U9' | 'U11' | 'U13' | 'U15' | 'Open',
                type: type as 'track' | 'field' | 'relay'
              });
              successCount++;
            } catch (error) {
              failedCount++;
            }
          });

          if (newEvents.length > 0) {
            setTrackEvents(prev => [...prev, ...newEvents]);
          }

          alert(`Import completed!\nSuccessful entries: ${successCount}\nFailed entries: ${failedCount}`);
        } catch (error) {
          alert('Error importing data. Please check the file format and try again.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExport = () => {
    const exportData = trackEvents.map(event => ({
      Event: event.name,
      Type: event.type,
      Gender: event.gender === 'M' ? 'Boys' : 'Girls',
      'Age Group': event.ageGroup
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Events');
    XLSX.writeFile(wb, 'events.xlsx');
  };

  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSubmit = (eventData: Omit<typeof newEvent, 'id'>) => {
    if (editingEvent) {
      setTrackEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === editingEvent.id ? { ...event, ...eventData } : event
        )
      );
    } else {
      const event = {
        id: Date.now().toString(),
        ...eventData
      };
      setTrackEvents([...trackEvents, event]);
    }
    setShowForm(false);
    setEditingEvent(null);
    setNewEvent({
      name: '',
      type: 'track',
      gender: 'M',
      ageGroup: 'U9'
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setTrackEvents(trackEvents.filter(event => event.id !== id));
    }
  };

  const getEntriesCount = (event: typeof trackEvents[0]) => {
    return athletes.filter(athlete => 
      athlete.events.includes(event.name) &&
      athlete.gender === event.gender &&
      athlete.ageCategory === event.ageGroup
    ).length;
  };

  // Define age group order
  const ageGroupOrder = {
    'U9': 1,
    'U11': 2,
    'U13': 3,
    'U15': 4,
    'Open': 5
  };

  const filteredAndSortedEvents = trackEvents
    .filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.ageGroup.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'entries') {
        const aEntries = getEntriesCount(a);
        const bEntries = getEntriesCount(b);
        return (aEntries - bEntries) * direction;
      }

      // Custom sorting for age groups and gender
      if (sortField === 'ageGroup') {
        // First compare age groups
        const ageGroupComparison = (ageGroupOrder[a.ageGroup] - ageGroupOrder[b.ageGroup]) * direction;
        if (ageGroupComparison !== 0) return ageGroupComparison;
        
        // If age groups are the same, sort by gender (Girls before Boys)
        return a.gender === b.gender ? 0 : (a.gender === 'F' ? -1 : 1) * direction;
      }

      // Default sorting for other fields
      if (a[sortField] < b[sortField]) return -1 * direction;
      if (a[sortField] > b[sortField]) return 1 * direction;
      return 0;
    });

  return (
    <div>
      <EventsToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onImport={handleImport}
        onExport={handleExport}
        onAdd={() => {
          setEditingEvent(null);
          setNewEvent({
            name: '',
            type: 'track',
            gender: 'M',
            ageGroup: 'U9'
          });
          setShowForm(true);
        }}
      />

      <EventsTable
        events={filteredAndSortedEvents}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={(event) => {
          setEditingEvent(event);
          setNewEvent({
            name: event.name,
            type: event.type,
            gender: event.gender,
            ageGroup: event.ageGroup
          });
          setShowForm(true);
        }}
        onDelete={handleDelete}
        getEntriesCount={getEntriesCount}
      />

      {showForm && (
        <EventForm
          event={newEvent}
          isEditing={!!editingEvent}
          onSubmit={handleSubmit}
          onChange={setNewEvent}
          onClose={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}