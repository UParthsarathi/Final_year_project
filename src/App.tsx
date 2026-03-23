import React, { useEffect, useState } from 'react';
import { useSensorStore } from './store/useSensorStore';
import { connectBLE, disconnectBLE } from './services/bleService';
import { Dashboard } from './components/Dashboard';
import { Relieve } from './components/Relieve';
import { Assess } from './components/Assess';
import { Guide } from './components/Guide';
import { Login } from './components/Login';
import { Activity, Play, Square, Wind, ClipboardList, MessageCircle, LogOut, Bluetooth } from 'lucide-react';
import { cn } from './lib/utils';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

type Tab = 'monitor' | 'relieve' | 'assess' | 'guide';

export default function App() {
  const { status } = useSensorStore();
  const [activeTab, setActiveTab] = useState<Tab>('monitor');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthChecking(false);
      
      if (!user) {
        disconnectBLE();
      }
    });

    return () => {
      unsubscribe();
      disconnectBLE();
    };
  }, []);

  const toggleConnection = async () => {
    if (status === 'connected' || status === 'connecting') {
      disconnectBLE();
    } else {
      try {
        await connectBLE();
      } catch (error) {
        console.error("Failed to connect BLE:", error);
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const tabs = [
    { id: 'monitor', label: 'Monitor', icon: Activity },
    { id: 'relieve', label: 'Relieve', icon: Wind },
    { id: 'assess', label: 'Assess', icon: ClipboardList },
    { id: 'guide', label: 'Guide', icon: MessageCircle },
  ] as const;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5A5A40]/30 border-t-[#5A5A40] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A] font-sans selection:bg-[#5A5A40]/20">
        <Login />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#1A1A1A] p-4 md:p-8 font-sans selection:bg-[#5A5A40]/20 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header & Navigation */}
        <header className="flex flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-[#2D2D2A]">Aura Wellness</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                status === 'connected' ? 'bg-[#5A5A40] animate-pulse' : 
                status === 'poor_signal' ? 'bg-amber-500' : 'bg-rose-500'
              )} />
              <span className="text-sm text-zinc-500 capitalize font-medium">
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
                      ? "bg-[#5A5A40] text-white shadow-sm" 
                      : "text-zinc-500 hover:text-[#2D2D2A] hover:bg-black/5"
                  )}
                >
                  <Icon size={16} className={isActive ? "text-white" : ""} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleConnection}
              disabled={status === 'connecting'}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors text-sm font-medium whitespace-nowrap",
                status === 'connected' 
                  ? "bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 border-[#5A5A40]/20 text-[#5A5A40]" 
                  : status === 'connecting'
                  ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 opacity-50 cursor-not-allowed"
                  : "bg-white hover:bg-zinc-50 border-[#E5E5E0] text-zinc-600 shadow-sm"
              )}
            >
              <Bluetooth size={16} className={status === 'connected' ? "animate-pulse" : ""} />
              <span className="hidden sm:inline">
                {status === 'connected' ? 'Disconnect Sensor' : status === 'connecting' ? 'Connecting...' : 'Connect Sensor'}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-rose-50 hover:text-rose-600 border border-[#E5E5E0] transition-colors text-zinc-500 shadow-sm"
              title="Sign Out"
            >
              <LogOut size={16} />
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-[#E5E5E0] pb-4">
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
                  isActive ? "text-[#5A5A40]" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-all",
                  isActive ? "bg-[#5A5A40]/10" : "bg-transparent"
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

