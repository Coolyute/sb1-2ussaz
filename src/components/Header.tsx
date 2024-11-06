import React, { useState } from 'react';
import { Timer, Settings } from 'lucide-react';

type TabType = 'dashboard' | 'events' | 'athletes' | 'teams' | 'entries' | 'heats' | 'finals' | 'results' | 'reports' | 'settings';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [isNavVisible, setIsNavVisible] = useState(true);

  const getTabClass = (tab: TabType) => {
    const baseClass = "px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
    return activeTab === tab
      ? `${baseClass} text-blue-600 border-b-2 border-blue-600`
      : `${baseClass} text-gray-500 hover:text-blue-600 hover:border-b-2 hover:border-blue-300`;
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-3">
            <Timer className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              TrackMaster Pro
            </h1>
          </div>
        </div>
        
        <nav 
          className="flex border-b overflow-x-auto"
          onMouseEnter={() => setIsNavVisible(true)}
          onMouseLeave={() => setIsNavVisible(true)}
          onFocus={() => setIsNavVisible(true)}
          onBlur={() => setIsNavVisible(true)}
        >
          <button
            onClick={() => onTabChange('dashboard')}
            className={getTabClass('dashboard')}
            role="tab"
            aria-selected={activeTab === 'dashboard'}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('events')}
            className={getTabClass('events')}
            role="tab"
            aria-selected={activeTab === 'events'}
          >
            Events
          </button>
          <button
            onClick={() => onTabChange('heats')}
            className={getTabClass('heats')}
            role="tab"
            aria-selected={activeTab === 'heats'}
          >
            Heats
          </button>
          <button
            onClick={() => onTabChange('finals')}
            className={getTabClass('finals')}
            role="tab"
            aria-selected={activeTab === 'finals'}
          >
            Finals
          </button>
          <button
            onClick={() => onTabChange('results')}
            className={getTabClass('results')}
            role="tab"
            aria-selected={activeTab === 'results'}
          >
            Results
          </button>
          <button
            onClick={() => onTabChange('athletes')}
            className={getTabClass('athletes')}
            role="tab"
            aria-selected={activeTab === 'athletes'}
          >
            Athletes
          </button>
          <button
            onClick={() => onTabChange('teams')}
            className={getTabClass('teams')}
            role="tab"
            aria-selected={activeTab === 'teams'}
          >
            Teams
          </button>
          <button
            onClick={() => onTabChange('entries')}
            className={getTabClass('entries')}
            role="tab"
            aria-selected={activeTab === 'entries'}
          >
            Entries
          </button>
          <button
            onClick={() => onTabChange('reports')}
            className={getTabClass('reports')}
            role="tab"
            aria-selected={activeTab === 'reports'}
          >
            Reports
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={getTabClass('settings')}
            role="tab"
            aria-selected={activeTab === 'settings'}
          >
            Settings
          </button>
        </nav>
      </div>
    </header>
  );
}