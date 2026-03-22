import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Wind, Headphones, Volume2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Relieve() {
  const [activeTab, setActiveTab] = useState<'breathing' | 'music'>('breathing');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breatheState, setBreatheState] = useState<'in' | 'hold' | 'out'>('in');
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);

  // Breathing logic
  useEffect(() => {
    if (!isBreathing) return;
    
    const cycle = () => {
      setBreatheState('in');
      setTimeout(() => {
        if (!isBreathing) return;
        setBreatheState('hold');
        setTimeout(() => {
          if (!isBreathing) return;
          setBreatheState('out');
          setTimeout(() => {
            if (isBreathing) cycle();
          }, 4000); // Exhale 4s
        }, 2000); // Hold 2s
      }, 4000); // Inhale 4s
    };

    cycle();
    return () => setIsBreathing(false);
  }, [isBreathing]);

  const tracks = [
    { id: 1, title: 'Deep Delta Waves', category: 'Sleep & Recovery', duration: '45:00' },
    { id: 2, title: 'Binaural Focus', category: 'Deep Work', duration: '30:00' },
    { id: 3, title: 'Forest Ambient', category: 'Anxiety Relief', duration: '15:00' },
    { id: 4, title: 'Solfeggio 528Hz', category: 'Healing', duration: '60:00' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-center mb-6 md:mb-8">
        <div className="glass-panel p-1 flex w-full md:w-auto rounded-full">
          <button
            onClick={() => setActiveTab('breathing')}
            className={cn(
              "flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2",
              activeTab === 'breathing' ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <Wind size={16} /> Breathing
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={cn(
              "flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2",
              activeTab === 'music' ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <Headphones size={16} /> Music
          </button>
        </div>
      </div>

      {activeTab === 'breathing' && (
        <div className="glass-panel p-6 md:p-12 flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          
          <div className="relative flex items-center justify-center w-56 h-56 md:w-64 md:h-64 mb-12">
            <motion.div
              animate={{
                scale: !isBreathing ? 1 : breatheState === 'in' ? 1.5 : breatheState === 'hold' ? 1.5 : 1,
                opacity: !isBreathing ? 0.3 : breatheState === 'in' ? 0.8 : breatheState === 'hold' ? 0.8 : 0.3,
              }}
              transition={{ duration: breatheState === 'hold' ? 2 : 4, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl"
            />
            <motion.div
              animate={{
                scale: !isBreathing ? 1 : breatheState === 'in' ? 1.2 : breatheState === 'hold' ? 1.2 : 1,
              }}
              transition={{ duration: breatheState === 'hold' ? 2 : 4, ease: 'easeInOut' }}
              className="absolute inset-8 rounded-full border border-indigo-500/30 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center shadow-2xl"
            >
              <span className="text-zinc-300 font-medium tracking-widest uppercase text-sm">
                {!isBreathing ? 'Ready' : breatheState === 'in' ? 'Inhale' : breatheState === 'hold' ? 'Hold' : 'Exhale'}
              </span>
            </motion.div>
          </div>

          <button
            onClick={() => setIsBreathing(!isBreathing)}
            className="px-8 py-3 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            {isBreathing ? 'Stop Exercise' : 'Start 4-7-8 Breathing'}
          </button>
        </div>
      )}

      {activeTab === 'music' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track) => (
            <div key={track.id} className="glass-panel p-4 flex items-center gap-4 group hover:bg-white/[0.02] transition-colors cursor-pointer">
              <button 
                onClick={() => setPlayingTrack(playingTrack === track.id ? null : track.id)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  playingTrack === track.id ? "bg-emerald-500 text-white" : "bg-white/5 text-zinc-400 group-hover:bg-white/10 group-hover:text-white"
                )}
              >
                {playingTrack === track.id ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
              </button>
              <div className="flex-1">
                <h4 className="text-zinc-100 font-medium">{track.title}</h4>
                <p className="text-zinc-500 text-sm">{track.category}</p>
              </div>
              <div className="flex items-center gap-3 text-zinc-500">
                {playingTrack === track.id && <Volume2 size={16} className="text-emerald-500 animate-pulse" />}
                <span className="text-sm font-mono">{track.duration}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
