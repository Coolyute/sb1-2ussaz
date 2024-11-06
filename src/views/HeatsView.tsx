import React, { useState } from "react";
import { Users } from "lucide-react";
import { useData } from "../context/DataContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { EventsList } from "../components/EventsList";
import { HeatCard } from "../components/HeatCard";
import { AddAthleteModal } from "../components/AddAthleteModal";
import { shuffleArray } from "../utils/arrayUtils";

interface EditingPosition {
  heatId: string;
  athleteId: string;
  position?: number;
}

export function HeatsView() {
  const { athletes, schools, trackEvents } = useData();
  const [heats, setHeats] = useLocalStorage('heats', []);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<EditingPosition | null>(null);
  const [activeHeats, setActiveHeats] = useState<string | null>(null);
  const [showAddAthleteModal, setShowAddAthleteModal] = useState(false);
  const [selectedHeatId, setSelectedHeatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'individual' | 'relay'>('individual');

  const handleGenerateHeats = (eventId: string) => {
    const selectedEvent = trackEvents.find(e => e.id === eventId);
    if (!selectedEvent) return;

    if (selectedEvent.type === 'relay') {
      // Handle relay events - group by school
      const schoolEntries = shuffleArray([...schools].map(school => ({
        schoolId: school.id,
        name: school.name
      })));

      const totalSchools = schoolEntries.length;
      const targetSchoolsPerHeat = 6; // Optimal number of schools per heat
      const numHeats = Math.ceil(totalSchools / targetSchoolsPerHeat);
      const baseSchoolsPerHeat = Math.floor(totalSchools / numHeats);
      const extraSchools = totalSchools % numHeats;

      // Initialize heats array for relay
      const newHeats = Array.from({ length: numHeats }, (_, index) => ({
        id: `${eventId}-heat-${index + 1}-${Date.now()}`,
        eventId,
        heatNumber: index + 1,
        lanes: [] as Array<{ lane: number; athleteId: string; position?: number }>,
        status: 'pending' as const
      }));

      // Distribute schools evenly across heats
      let schoolIndex = 0;
      for (let heatIndex = 0; heatIndex < numHeats; heatIndex++) {
        // Calculate how many schools should go in this heat
        const schoolsInThisHeat = baseSchoolsPerHeat + (heatIndex < extraSchools ? 1 : 0);
        
        for (let i = 0; i < schoolsInThisHeat && schoolIndex < totalSchools; i++) {
          const school = schoolEntries[schoolIndex];
          const lane = i + 1; // Lanes start from 1
          
          newHeats[heatIndex].lanes.push({
            lane,
            athleteId: school.schoolId // Using schoolId as athleteId for relay events
          });
          
          schoolIndex++;
        }
      }

      // Update heats
      const existingHeats = heats.filter(heat => heat.eventId !== eventId);
      setHeats([...existingHeats, ...newHeats.filter(heat => heat.lanes.length > 0)]);
      setActiveHeats(eventId);
      return;
    }

    // Rest of the code for individual events remains the same...
    const eventEntries = athletes.filter(athlete => 
      athlete.events.includes(selectedEvent.name) && 
      athlete.gender === selectedEvent.gender &&
      athlete.ageCategory === selectedEvent.ageGroup
    );

    if (selectedEvent.ageGroup === 'Open') {
      const newHeat = {
        id: `${eventId}-open-${Date.now()}`,
        eventId,
        heatNumber: 1,
        lanes: eventEntries.map(athlete => ({
          athleteId: athlete.id,
          position: undefined as number | undefined
        })),
        status: 'pending' as const
      };

      const existingHeats = heats.filter(heat => heat.eventId !== eventId);
      setHeats([...existingHeats, newHeat]);
      setActiveHeats(eventId);
      return;
    }

    // Group athletes by school
    const athletesBySchool = eventEntries.reduce((acc, athlete) => {
      if (!acc[athlete.schoolId]) {
        acc[athlete.schoolId] = [];
      }
      acc[athlete.schoolId].push(athlete);
      return acc;
    }, {} as Record<string, typeof athletes>);

    const athletesPerHeat = 8;
    const totalAthletes = eventEntries.length;
    const numHeats = Math.ceil(totalAthletes / athletesPerHeat);
    
    const newHeats = Array.from({ length: numHeats }, (_, index) => ({
      id: `${eventId}-heat-${index + 1}-${Date.now()}`,
      eventId,
      heatNumber: index + 1,
      lanes: [] as Array<{ lane: number; athleteId: string; position?: number }>,
      status: 'pending' as const
    }));

    const schoolIds = Object.keys(athletesBySchool);
    let currentHeatIndex = 0;
    let currentLane = 1;

    const schoolsInHeat = newHeats.map(() => new Set<string>());
    
    while (schoolIds.some(schoolId => athletesBySchool[schoolId].length > 0)) {
      const availableSchools = schoolIds.filter(schoolId => 
        athletesBySchool[schoolId].length > 0 &&
        !schoolsInHeat[currentHeatIndex].has(schoolId)
      );

      if (availableSchools.length === 0) {
        currentHeatIndex = (currentHeatIndex + 1) % numHeats;
        if (currentHeatIndex === 0) currentLane++;
        if (currentLane > athletesPerHeat) break;
        continue;
      }

      const randomSchoolIndex = Math.floor(Math.random() * availableSchools.length);
      const schoolId = availableSchools[randomSchoolIndex];
      
      const athlete = athletesBySchool[schoolId].shift()!;
      newHeats[currentHeatIndex].lanes.push({
        lane: currentLane,
        athleteId: athlete.id
      });
      
      schoolsInHeat[currentHeatIndex].add(schoolId);
      currentHeatIndex = (currentHeatIndex + 1) % numHeats;
      if (currentHeatIndex === 0) currentLane++;
    }

    // Handle remaining athletes
    const remainingAthletes = schoolIds.flatMap(schoolId => athletesBySchool[schoolId]);
    if (remainingAthletes.length > 0) {
      const shuffledRemaining = shuffleArray(remainingAthletes);
      
      for (const athlete of shuffledRemaining) {
        const heatIndex = newHeats.reduce((bestIndex, heat, index) => {
          const schoolCount = heat.lanes.filter(lane => 
            athletes.find(a => a.id === lane.athleteId)?.schoolId === athlete.schoolId
          ).length;
          
          const bestCount = newHeats[bestIndex].lanes.filter(lane =>
            athletes.find(a => a.id === lane.athleteId)?.schoolId === athlete.schoolId
          ).length;

          return schoolCount < bestCount ? index : bestIndex;
        }, 0);

        const usedLanes = new Set(newHeats[heatIndex].lanes.map(l => l.lane));
        const emptyLane = Array.from({ length: athletesPerHeat }, (_, i) => i + 1)
          .find(lane => !usedLanes.has(lane));

        if (emptyLane) {
          newHeats[heatIndex].lanes.push({
            lane: emptyLane,
            athleteId: athlete.id
          });
        }
      }
    }

    // Sort lanes within each heat
    newHeats.forEach(heat => {
      heat.lanes.sort((a, b) => a.lane - b.lane);
    });

    // Filter out empty heats and update heat numbers
    const filledHeats = newHeats
      .filter(heat => heat.lanes.length > 0)
      .map((heat, index) => ({
        ...heat,
        heatNumber: index + 1
      }));

    const existingHeats = heats.filter(heat => heat.eventId !== eventId);
    setHeats([...existingHeats, ...filledHeats]);
    setActiveHeats(eventId);
  };

  // Rest of the component code remains the same...
  const handlePositionChange = (heatId: string, athleteId: string, position?: number) => {
    setHeats(prevHeats => 
      prevHeats.map(heat => {
        if (heat.id === heatId) {
          const updatedLanes = heat.lanes.map(lane => {
            if (lane.athleteId === athleteId) {
              return { ...lane, position };
            }
            return lane;
          }).sort((a, b) => {
            if (!a.position) return 1;
            if (!b.position) return -1;
            return a.position - b.position;
          });
          return { ...heat, lanes: updatedLanes };
        }
        return heat;
      })
    );
  };

  const handleRemoveAthlete = (heatId: string, athleteId: string) => {
    if (window.confirm('Are you sure you want to remove this athlete from the heat?')) {
      setHeats(prevHeats =>
        prevHeats.map(heat => {
          if (heat.id === heatId) {
            return {
              ...heat,
              lanes: heat.lanes.filter(lane => lane.athleteId !== athleteId)
            };
          }
          return heat;
        })
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, athleteId: string, currentIndex: number) => {
    const heat = heats.find(h => h.id === selectedHeatId);
    if (!heat) return;

    if (e.key >= '1' && e.key <= '8') {
      e.preventDefault();
      handlePositionChange(heat.id, athleteId, parseInt(e.key));
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          const prevAthlete = heat.lanes[currentIndex - 1];
          setEditingPosition({
            heatId: heat.id,
            athleteId: prevAthlete.athleteId,
            position: prevAthlete.position
          });
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < heat.lanes.length - 1) {
          const nextAthlete = heat.lanes[currentIndex + 1];
          setEditingPosition({
            heatId: heat.id,
            athleteId: nextAthlete.athleteId,
            position: nextAthlete.position
          });
        }
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        handlePositionChange(heat.id, athleteId, undefined);
        break;
    }
  };

  const selectedEventHeats = activeHeats
    ? heats.filter(heat => heat.eventId === activeHeats)
    : [];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <EventsList
        events={trackEvents}
        selectedEvent={selectedEvent}
        onEventSelect={(eventId) => {
          setSelectedEvent(eventId);
          setActiveHeats(eventId);
        }}
        onGenerateHeats={handleGenerateHeats}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {selectedEvent && selectedEventHeats.length > 0 ? (
          <div className="space-y-6">
            {selectedEventHeats.map((heat) => (
              <HeatCard
                key={heat.id}
                heat={heat}
                athletes={athletes}
                schools={schools}
                editingPosition={editingPosition}
                onPositionChange={handlePositionChange}
                onRemoveAthlete={handleRemoveAthlete}
                onAddAthlete={(heatId) => {
                  setSelectedHeatId(heatId);
                  setShowAddAthleteModal(true);
                }}
                onLaneClick={(heatId, athleteId, position) => {
                  setEditingPosition({
                    heatId,
                    athleteId,
                    position
                  });
                  setSelectedHeatId(heatId);
                }}
                onKeyDown={handleKeyDown}
                isRelay={activeTab === 'relay'}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Users className="w-12 h-12 mb-2" />
            <p>Select an event and generate heats to get started</p>
          </div>
        )}
      </div>

      {showAddAthleteModal && selectedHeatId && (
        <AddAthleteModal
          athletes={athletes}
          schools={schools}
          onClose={() => setShowAddAthleteModal(false)}
          onAddAthlete={(athleteId) => {
            setHeats(prevHeats =>
              prevHeats.map(heat => {
                if (heat.id === selectedHeatId) {
                  const maxLane = Math.max(...heat.lanes.map(l => l.lane), 0);
                  return {
                    ...heat,
                    lanes: [...heat.lanes, { lane: maxLane + 1, athleteId }]
                  };
                }
                return heat;
              })
            );
            setShowAddAthleteModal(false);
          }}
          isRelay={activeTab === 'relay'}
        />
      )}
    </div>
  );
}