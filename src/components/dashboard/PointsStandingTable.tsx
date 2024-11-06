import React from 'react';

export function PointsStandingTable() {
  const standings = [
    { name: "Top Hill Primary", points: 205, position: 1 },
    { name: "Bull Savannah Primary", points: 180, position: 2 },
    { name: "Bethlehem Primary", points: 150, position: 3 },
    { name: "Mayfield Primary", points: 100, position: 4 },
    { name: "Morning Side Primary", points: 91, position: 5 },
    { name: "Ballard's Valley Primary", points: 76, position: 6 },
    { name: "Brinkley Primary", points: 71, position: 7 },
    { name: "Epping Forest Primary", points: 49, position: 8 },
    { name: "St. Mary's Primary", points: 45, position: 9 }
  ];

  return (
    <table className="w-full">
      <tbody>
        {standings.map((school) => (
          <tr key={school.name} className={school.position % 2 === 0 ? 'bg-orange-50' : 'bg-white'}>
            <td className="p-2">{school.name}</td>
            <td className="p-2 text-right font-bold">{school.points}</td>
            <td className="p-2 text-right w-8">{school.position}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}