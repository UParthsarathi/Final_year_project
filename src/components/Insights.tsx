import React, { useMemo } from 'react';
import { useSensorStore } from '../store/useSensorStore';
import { Brain, Activity, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function Insights() {
  const history = useSensorStore((state) => state.history);

  const insights = useMemo(() => {
    if (history.length < 10) {
      return {
        stressLevel: 'Calibrating...',
        stressDescription: 'Gathering baseline data to provide accurate insights.',
        avgBpm: 0,
        edaTrend: 'stable',
        status: 'normal' as const,
      };
    }

    // Calculate averages over the last N points
    const recent = history.slice(-30); // Last 30 seconds
    const older = history.slice(-60, -30); // Previous 30 seconds

    const avgBpmRecent = recent.reduce((sum, p) => sum + p.bpm, 0) / recent.length;
    const avgBpmOlder = older.length > 0 ? older.reduce((sum, p) => sum + p.bpm, 0) / older.length : avgBpmRecent;
    
    const avgEdaRecent = recent.reduce((sum, p) => sum + p.eda, 0) / recent.length;
    const avgEdaOlder = older.length > 0 ? older.reduce((sum, p) => sum + p.eda, 0) / older.length : avgEdaRecent;

    // Determine trends
    const bpmDiff = avgBpmRecent - avgBpmOlder;
    const edaDiff = avgEdaRecent - avgEdaOlder;

    let stressLevel = 'Balanced';
    let stressDescription = 'Your physiological activity is stable and within normal baseline ranges.';
    let status: 'normal' | 'warning' | 'critical' = 'normal';

    if (edaDiff > 0.2 && bpmDiff > 5) {
      stressLevel = 'Elevated Stress';
      stressDescription = 'Both heart rate and electrodermal activity are rising. Consider taking a moment to breathe and reset.';
      status = 'critical';
    } else if (edaDiff > 0.1 || bpmDiff > 3) {
      stressLevel = 'Mild Arousal';
      stressDescription = 'Slight elevation in physiological activity detected. This is normal during focus or light stress.';
      status = 'warning';
    } else if (edaDiff < -0.1 && bpmDiff < -2) {
      stressLevel = 'Deep Recovery';
      stressDescription = 'Your metrics indicate a state of deep relaxation and recovery. Excellent for recharging.';
      status = 'normal';
    }

    return {
      stressLevel,
      stressDescription,
      avgBpm: Math.round(avgBpmRecent),
      edaTrend: edaDiff > 0.05 ? 'increasing' : edaDiff < -0.05 ? 'decreasing' : 'stable',
      status,
    };
  }, [history]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6 md:col-span-2 flex flex-col justify-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Brain size={120} />
        </div>
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Current State
        </h3>
        <h2 className="text-3xl font-semibold text-zinc-50 mb-3">
          {insights.stressLevel}
        </h2>
        <p className="text-zinc-400 max-w-md leading-relaxed">
          {insights.stressDescription}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 flex flex-col gap-6"
      >
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
            <Activity size={16} />
            <span>Avg BPM (30s)</span>
          </div>
          <div className="text-3xl font-mono font-bold text-zinc-50">
            {insights.avgBpm || '--'}
          </div>
        </div>
        
        <div className="h-px w-full bg-white/10" />

        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
            <Zap size={16} />
            <span>EDA Trend</span>
          </div>
          <div className="text-xl font-medium text-zinc-50 capitalize">
            {insights.edaTrend}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
