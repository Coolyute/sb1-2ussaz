import React, { useState } from 'react';
import { ReportHeader } from '../components/reports/ReportHeader';
import { EventTypeToggle } from '../components/reports/EventTypeToggle';
import { ReportFilters } from '../components/reports/ReportFilters';
import { SchoolFinalistsReport } from '../components/reports/SchoolFinalistsReport';
import { TeamPointsDisplay } from '../components/shared/TeamPointsDisplay';
import { useData } from '../context/DataContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { printReport } from '../utils/printUtils';
import { laneAssignmentOrder } from '../utils/laneUtils';

type ReportType = 'heats' | 'finals' | 'schoolFinalists' | 'teamPoints';

export function ReportsView() {
  const { schools, athletes, trackEvents } = useData();
  const [heats] = useLocalStorage('heats', []);
  const [finalPositions] = useLocalStorage('finalPositions', {});
  const [selectedReport, setSelectedReport] = useState<ReportType>('heats');
  const [reportType, setReportType] = useState<'individual' | 'relay'>('individual');
  const [filters, setFilters] = useState({
    ageGroup: 'all',
    gender: 'all',
    school: 'all',
    event: 'all'
  });

  const generateHeatsReport = () => {
    const reportData = [];
    
    for (const heat of heats) {
      const event = trackEvents.find(e => e.id === heat.eventId);
      if (!event) continue;
      
      if (reportType === 'relay' ? event.type !== 'relay' : event.type === 'relay') continue;

      if (filters.ageGroup !== 'all' && event.ageGroup !== filters.ageGroup) continue;
      if (filters.gender !== 'all' && event.gender !== filters.gender) continue;
      if (filters.event !== 'all' && event.name !== filters.event) continue;

      const formattedHeat = {
        event: event.name,
        gender: event.gender === 'M' ? 'Boys' : 'Girls',
        ageGroup: event.ageGroup,
        heatNumber: heat.heatNumber,
        lanes: heat.lanes.map(lane => {
          if (reportType === 'relay') {
            const school = schools.find(s => s.id === lane.athleteId);
            if (filters.school !== 'all' && school?.id !== filters.school) return null;
            return {
              lane: lane.lane,
              name: school?.name || '',
            };
          } else {
            const athlete = athletes.find(a => a.id === lane.athleteId);
            const school = schools.find(s => s.id === athlete?.schoolId);
            if (filters.school !== 'all' && school?.id !== filters.school) return null;
            return {
              lane: lane.lane,
              name: athlete?.name || '',
              school: school?.name || ''
            };
          }
        }).filter(Boolean).sort((a, b) => a.lane - b.lane)
      };

      if (formattedHeat.lanes.length > 0) {
        reportData.push(formattedHeat);
      }
    }

    return reportData;
  };

  const generateFinalsReport = () => {
    return trackEvents
      .filter(event => reportType === 'relay' ? event.type === 'relay' : event.type !== 'relay')
      .map(event => {
        const eventHeats = heats.filter(heat => heat.eventId === event.id);
        const allLanes = eventHeats.flatMap(heat => heat.lanes);
        
        const finalists = allLanes
          .filter(lane => lane.position !== undefined)
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .slice(0, 8)
          .map((lane, index) => {
            const finalPosition = finalPositions[`${event.id}-${lane.athleteId}`];
            
            if (event.type === 'relay') {
              const school = schools.find(s => s.id === lane.athleteId);
              return {
                lane: laneAssignmentOrder[index],
                name: school?.name || '',
                position: finalPosition
              };
            } else {
              const athlete = athletes.find(a => a.id === lane.athleteId);
              const school = schools.find(s => s.id === athlete?.schoolId);
              return {
                lane: laneAssignmentOrder[index],
                name: athlete?.name || '',
                school: school?.name || '',
                position: finalPosition
              };
            }
          })
          .sort((a, b) => a.lane - b.lane);

        return {
          eventName: `${event.gender === 'M' ? 'Boys' : 'Girls'} ${event.ageGroup} - ${event.name}`,
          finalists
        };
      })
      .filter(event => event.finalists.length > 0);
  };

  const handlePrint = () => {
    let content = '';
    
    if (selectedReport === 'heats') {
      const heatsData = generateHeatsReport();
      content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Heats Report</title>
            <style>
              @page { size: A4; margin: 1cm; }
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
              th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
              th { background-color: #f5f5f5; }
              h2 { margin: 10px 0 5px; }
              .heat-number { font-size: 0.9em; margin: 5px 0; }
            </style>
          </head>
          <body>
            <h1>${reportType === 'relay' ? 'Relay' : 'Individual'} Heats Report</h1>
            ${heatsData.map(heat => `
              <h2>${heat.event} - ${heat.gender} ${heat.ageGroup}</h2>
              <div class="heat-number">Heat ${heat.heatNumber}</div>
              <table>
                <thead>
                  <tr>
                    <th>Lane</th>
                    <th>${reportType === 'relay' ? 'School' : 'Athlete'}</th>
                    ${reportType !== 'relay' ? '<th>School</th>' : ''}
                  </tr>
                </thead>
                <tbody>
                  ${heat.lanes.map(lane => `
                    <tr>
                      <td>${lane.lane}</td>
                      <td>${lane.name}</td>
                      ${reportType !== 'relay' ? `<td>${lane.school}</td>` : ''}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `).join('')}
          </body>
        </html>
      `;
    } else if (selectedReport === 'finals') {
      const finalsData = generateFinalsReport();
      content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Finals Report</title>
            <style>
              @page { size: A4; margin: 1cm; }
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
              th { background-color: #f5f5f5; }
              h2 { margin: 15px 0 5px; }
            </style>
          </head>
          <body>
            <h1>${reportType === 'relay' ? 'Relay' : 'Individual'} Finals</h1>
            ${finalsData.map(event => `
              <h2>${event.eventName}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Lane</th>
                    <th>${reportType === 'relay' ? 'School' : 'Name'}</th>
                    ${reportType !== 'relay' ? '<th>School</th>' : ''}
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>
                  ${event.finalists.map(finalist => `
                    <tr>
                      <td>${finalist.lane}</td>
                      <td>${finalist.name}</td>
                      ${reportType !== 'relay' ? `<td>${finalist.school}</td>` : ''}
                      <td>${finalist.position || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `).join('')}
          </body>
        </html>
      `;
    } else if (selectedReport === 'teamPoints') {
      const teamPointsElement = document.querySelector('.team-points-report');
      content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Team Points Report</title>
            <style>
              @page { size: A4; margin: 1cm; }
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
              th { background-color: #f5f5f5; }
              h2 { margin: 15px 0 5px; }
            </style>
          </head>
          <body>
            <h1>Team Points Report</h1>
            ${teamPointsElement ? teamPointsElement.innerHTML : '<p>No team points data available</p>'}
          </body>
        </html>
      `;
    } else if (selectedReport === 'schoolFinalists') {
      const schoolFinalistsElement = document.querySelector('.school-finalists-report');
      content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>School Finalists Report</title>
            <style>
              @page { size: A4; margin: 1cm; }
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
              th { background-color: #f5f5f5; }
              h2 { margin: 15px 0 5px; }
            </style>
          </head>
          <body>
            <h1>School Finalists Report</h1>
            ${schoolFinalistsElement ? schoolFinalistsElement.innerHTML : '<p>No school finalists data available</p>'}
          </body>
        </html>
      `;
    }

    printReport(content);
  };

  return (
    <div className="p-6">
      <ReportHeader
        selectedReport={selectedReport}
        onReportChange={(report) => setSelectedReport(report as ReportType)}
        onPrint={handlePrint}
      />

      {selectedReport === 'teamPoints' ? (
        <div className="team-points-report">
          <TeamPointsDisplay variant="full" />
        </div>
      ) : selectedReport === 'schoolFinalists' ? (
        <div className="school-finalists-report">
          <SchoolFinalistsReport />
        </div>
      ) : (
        <>
          <EventTypeToggle reportType={reportType} onTypeChange={setReportType} />
          <ReportFilters
            filters={filters}
            onFilterChange={setFilters}
            schools={schools}
            trackEvents={trackEvents}
          />

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
            
            {selectedReport === 'heats' && (
              <div className="space-y-6">
                {generateHeatsReport().map((heat, index) => (
                  <div key={`${heat.event}-${heat.heatNumber}-${index}`} className="bg-gray-50 rounded-lg p-4">
                    <div className="font-semibold text-lg mb-2">
                      {heat.event} - {heat.gender} {heat.ageGroup}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Heat {heat.heatNumber}</div>
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left w-16">Lane</th>
                          <th className="px-4 py-2 text-left">{reportType === 'relay' ? 'School' : 'Athlete'}</th>
                          {reportType !== 'relay' && <th className="px-4 py-2 text-left">School</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {heat.lanes.map((lane, laneIndex) => (
                          <tr key={`${lane.lane}-${laneIndex}`} className="border-t border-gray-200">
                            <td className="px-4 py-2">{lane.lane}</td>
                            <td className="px-4 py-2">{lane.name}</td>
                            {reportType !== 'relay' && <td className="px-4 py-2">{lane.school}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {selectedReport === 'finals' && (
              <div className="space-y-6">
                {generateFinalsReport().map((event, index) => (
                  <div key={`${event.eventName}-${index}`} className="bg-gray-50 rounded-lg p-4">
                    <div className="font-semibold text-lg mb-2">{event.eventName}</div>
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left w-16">Lane</th>
                          <th className="px-4 py-2 text-left">{reportType === 'relay' ? 'School' : 'Name'}</th>
                          {reportType !== 'relay' && <th className="px-4 py-2 text-left">School</th>}
                          <th className="px-4 py-2 text-left">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.finalists.map((finalist, idx) => (
                          <tr key={`${event.eventName}-${idx}`} className="border-t border-gray-200">
                            <td className="px-4 py-2">{finalist.lane}</td>
                            <td className="px-4 py-2">{finalist.name}</td>
                            {reportType !== 'relay' && <td className="px-4 py-2">{finalist.school}</td>}
                            <td className="px-4 py-2">{finalist.position || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}