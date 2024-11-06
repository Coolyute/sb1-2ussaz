// Previous imports remain the same...

interface HeatTableProps {
  // Previous props remain the same...
  onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>, athleteId: string, index: number) => void;
}

export function HeatTable({
  heat,
  athletes,
  schools,
  editingPosition,
  onPositionEdit,
  onPositionChange,
  onRemoveAthlete,
  onAddAthleteClick,
  onKeyDown
}: HeatTableProps) {
  const maxLanes = 8;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Heat {heat.heatNumber}</h3>
      <table className="min-w-full">
        {/* Header remains the same */}
        <tbody>
          {Array.from({ length: maxLanes }, (_, i) => i + 1).map((laneNumber, index) => {
            const lane = heat.lanes.find(l => l.lane === laneNumber);
            const athlete = lane ? athletes.find(a => a.id === lane.athleteId) : null;
            const school = athlete ? schools.find(s => s.id === athlete.schoolId) : null;
            const isEditing = editingPosition?.heatId === heat.id && 
                            editingPosition?.athleteId === lane?.athleteId;

            return (
              <tr 
                key={`${heat.id}-${laneNumber}`} 
                className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}
                tabIndex={lane ? 0 : -1}
                onKeyDown={(e) => lane && onKeyDown(e, lane.athleteId, index)}
                onClick={() => {
                  if (lane && !isEditing) {
                    onPositionEdit(heat.id, lane.athleteId, lane.position);
                  }
                }}
              >
                {/* Rest of the row content remains the same */}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}