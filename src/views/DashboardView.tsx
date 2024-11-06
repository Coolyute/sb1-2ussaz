import React from 'react';
import { useData } from '../context/DataContext';
import { PointsStandingTable } from '../components/dashboard/PointsStandingTable';

export function DashboardView() {
  const { schools, athletes, trackEvents } = useData();

  // Calculate statistics
  const totalSchools = schools.length;
  const totalEvents = trackEvents.length;
  const totalAthletes = athletes.length;

  const athletesByAgeGroup = {
    'U9': athletes.filter(a => a.ageCategory === 'U9').length,
    'U11': athletes.filter(a => a.ageCategory === 'U11').length,
    'U13': athletes.filter(a => a.ageCategory === 'U13').length,
    'U15': athletes.filter(a => a.ageCategory === 'U15').length,
    'Open': athletes.filter(a => a.ageCategory === 'Open').length,
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-center text-orange-700 mb-8">SESETA DA MEET 2024</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meet Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">MEET STATS</h2>
          <table className="w-full">
            <tbody>
              <tr className="bg-green-600">
                <td className="p-2 text-white">School</td>
                <td className="p-2 text-right text-white font-bold">{totalSchools}</td>
              </tr>
              <tr className="bg-green-100">
                <td className="p-2">Events</td>
                <td className="p-2 text-right font-bold">{totalEvents}</td>
              </tr>
              <tr className="bg-green-100">
                <td className="p-2">Athletes</td>
                <td className="p-2 text-right font-bold">{totalAthletes}</td>
              </tr>
              <tr className="bg-green-100">
                <td className="p-2">U9</td>
                <td className="p-2 text-right font-bold">{athletesByAgeGroup['U9']}</td>
              </tr>
              <tr className="bg-green-100">
                <td className="p-2">U11</td>
                <td className="p-2 text-right font-bold">{athletesByAgeGroup['U11']}</td>
              </tr>
              <tr className="bg-green-100">
                <td className="p-2">U13</td>
                <td className="p-2 text-right font-bold">{athletesByAgeGroup['U13']}</td>
              </tr>
              <tr className="bg-green-100">
                <td className="p-2">U15</td>
                <td className="p-2 text-right font-bold">{athletesByAgeGroup['U15']}</td>
              </tr>
              <tr className="bg-green-100">
                <td className="p-2">Open</td>
                <td className="p-2 text-right font-bold">{athletesByAgeGroup['Open']}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Points Standing */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">POINTS STANDING</h2>
          <PointsStandingTable />
        </div>

        {/* Top Athletes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">TOP ATHLETES</h2>
          <table className="w-full">
            <tbody>
              {[
                { category: "Girls U9", name: "Shade Bent", points: 18 },
                { category: "Boys U9", name: "Jden Pink", points: 18 },
                { category: "Girls U11", name: "Blessing Bent", points: 16 },
                { category: "Boys U11", name: "Itamar Hines", points: 18 },
                { category: "Girls U13", name: "Meredith Smith", points: 18 },
                { category: "Boys U13", name: "Jayden Mcintosh", points: 16 },
                { category: "Girls U15", name: "Breanae Williams", points: 16 },
                { category: "Boys U15", name: "Jayden Saunders", points: 18 },
                { category: "Girls Open", name: "Shamoya Chamberlin", points: 18 },
                { category: "Boys Open", name: "Roshawn Morris", points: 15 }
              ].map((athlete, index) => (
                <tr key={athlete.name} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                  <td className="p-2 w-24">{athlete.category}</td>
                  <td className="p-2">{athlete.name}</td>
                  <td className="p-2 text-right font-bold">{athlete.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}