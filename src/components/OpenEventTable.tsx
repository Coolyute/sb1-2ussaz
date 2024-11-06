// Previous imports remain the same...

interface OpenEventTableProps {
  // Previous props remain the same...
  onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>, athleteId: string, index: number) => void;
}

export function OpenEventTable({
  heat,
  athletes,
  schools,
  editingPosition,
  onPositionEdit,
  onPositionChange,
  onRemoveAthlete,
  onAddAthleteClick,
  onKeyDown
}: OpenEventTableProps) {
  const maxPosition = heat.athletes.length;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Open Event</h3>
        <button
          onClick={() => onAddAthleteClick(heat.id)}
          className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Athlete
        </button>
      </div>
      <table className="min-w-full">
        {/* Header remains the same */}
        <tbody>
          {heat.athletes.map((entry, index) => {
            const athlete = athletes.find(a => a.id === entry.athleteId);
            const school = athlete ? schools.find(s => s.id === athlete.schoolId) : null;
            const isEditing = editingPosition?.heatId === heat.id && 
                            editingPosition?.athleteId === entry.athleteId;

            return (
              <tr 
                key={entry.athleteId} 
                className={`hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}
                tabIndex={0}
                onKeyDown={(e) => onKeyDown(e, entry.athleteId, index)}
                onClick={() => {
                  if (!isEditing) {
                    onPositionEdit(heat.id, entry.athleteId, entry.position);
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