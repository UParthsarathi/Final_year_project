import React, { useEffect, useState } from 'react';
import { useSensorStore } from './store/useSensorStore';
import { startMockSensor, stopMockSensor } from './services/mockSensor';
import { Dashboard } from './components/Dashboard';
import { Relieve } from './components/Relieve';
import { Assess } from './components/Assess';
import { Guide } from './components/Guide';
import { Login } from './components/Login';
import { Activity, Play, Square, Wind, ClipboardList, MessageCircle } from 'lucide-react';
import { cn } from './lib/utils';

type Tab = 'monitor' | 'relieve' | 'assess' | 'guide';

export default function App() {
  const { status } = useSensorStore();
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('monitor');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Start simulation on mount for demo purposes
    startMockSensor();
    setIsSimulating(true);
    return () => stopMockSensor();
  }, []);

  const toggleSimulation = () => {
    if (isSimulating) {
      stopMockSensor();
    } else {
      startMockSensor();
    }
    setIsSimulating(!isSimulating);
  };

  const tabs = [
    { id: 'monitor', label: 'Monitor', icon: Activity },
    { id: 'relieve', label: 'Relieve', icon: Wind },
    { id: 'assess', label: 'Assess', icon: ClipboardList },
    { id: 'guide', label: 'Guide', icon: MessageCircle },
  ] as const;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
        <Login onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-8 font-sans selection:bg-emerald-500/30 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header & Navigation */}
        <header className="flex flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Aura Wellness</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                status === 'connected' ? 'bg-emerald-500 animate-pulse' : 
                status === 'poor_signal' ? 'bg-amber-500' : 'bg-rose-500'
              )} />
              <span className="text-sm text-zinc-400 capitalize">
                {status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <nav className="hidden md:flex glass-panel p-1.5 items-center gap-1 rounded-full overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                    isActive 
                      ? "bg-white/10 text-white shadow-sm" 
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  )}
                >
                  <Icon size={16} className={isActive ? "text-indigo-400" : ""} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSimulation}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium whitespace-nowrap"
            >
              {isSimulating ? <Square size={16} className="text-rose-400" /> : <Play size={16} className="text-emerald-400" />}
              <span className="hidden sm:inline">{isSimulating ? 'Stop Stream' : 'Start Stream'}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="pt-4">
          {activeTab === 'monitor' && <Dashboard />}
          {activeTab === 'relieve' && <Relieve />}
          {activeTab === 'assess' && <Assess />}
          {activeTab === 'guide' && <Guide />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-2xl border-t border-white/10 pb-4">
        <div className="flex items-center justify-around p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-14 gap-1 rounded-2xl transition-all",
                  isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                  isActive ? "bg-indigo-500/20" : "bg-transparent"
                )}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

