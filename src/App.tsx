import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DashboardView } from "./views/DashboardView";
import { EventsView } from "./views/EventsView";
import { AthletesView } from "./views/AthletesView";
import { TeamsView } from "./views/TeamsView";
import { EntriesView } from "./views/EntriesView";
import { HeatsView } from "./views/HeatsView";
import { FinalsView } from "./views/FinalsView";
import { ResultsView } from "./views/ResultsView";
import { SettingsView } from "./views/SettingsView";
import { ReportsView } from "./views/ReportsView";
import { DataProvider, useData } from "./context/DataContext";

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { initializeRelayEvents, trackEvents } = useData();

  // Initialize relay events if they don't exist
  useEffect(() => {
    const hasRelayEvents = trackEvents.some(event => event.type === 'relay');
    if (!hasRelayEvents) {
      initializeRelayEvents();
    }
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "events":
        return <EventsView />;
      case "athletes":
        return <AthletesView />;
      case "teams":
        return <TeamsView />;
      case "entries":
        return <EntriesView />;
      case "heats":
        return <HeatsView />;
      case "finals":
        return <FinalsView />;
      case "results":
        return <ResultsView />;
      case "reports":
        return <ReportsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}