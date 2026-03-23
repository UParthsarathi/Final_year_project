import React, { useMemo } from 'react';
import { useSensorStore } from '../store/useSensorStore';
import { Brain, Activity, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function Insights() {
  const stressHistory = useSensorStore((state) => state.stressHistory);

  const insights = useMemo(() => {
    if (stressHistory.length < 5) {
      return {
        stressLevel: 'Calibrating...',
        stressDescription: 'Gathering baseline data to provide accurate insights.',
        stressTrend: 'stable',
        status: 'normal' as const,
      };
    }

    // Calculate averages over the last N points
    const recent = stressHistory.slice(-10); // Last 10 points
    const older = stressHistory.slice(-20, -10); // Previous 10 points

    const avgStressRecent = recent.reduce((sum, p) => sum + p.weightedStress, 0) / recent.length;
    const avgStressOlder = older.length > 0 ? older.reduce((sum, p) => sum + p.weightedStress, 0) / older.length : avgStressRecent;

    // Determine trends
    const stressDiff = avgStressRecent - avgStressOlder;

    let stressLevel = 'Balanced';
    let stressDescription = 'Your physiological activity is stable and within normal baseline ranges.';
    let status: 'normal' | 'warning' | 'critical' = 'normal';

    if (avgStressRecent > 70) {
      stressLevel = 'High Stress';
      stressDescription = 'Your stress score is significantly elevated. Consider a guided breathing session to help regulate your nervous system.';
      status = 'critical';
    } else if (avgStressRecent > 40) {
      stressLevel = 'Moderate Stress';
      stressDescription = 'Slight elevation in stress detected. This is common during focused work or mild activity.';
      status = 'warning';
    } else {
      stressLevel = 'Relaxed';
      stressDescription = 'Your metrics indicate a state of calm and recovery. Excellent for maintaining long-term wellness.';
      status = 'normal';
    }

    return {
      stressLevel,
      stressDescription,
      stressTrend: stressDiff > 5 ? 'increasing' : stressDiff < -5 ? 'decreasing' : 'stable',
      status,
    };
  }, [stressHistory]);

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
        <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wider mb-2">
          Current State
        </h3>
        <h2 className="text-3xl font-semibold text-zinc-50 mb-3">
          {insights.stressLevel}
        </h2>
        <p className="text-zinc-300 max-w-md leading-relaxed">
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
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300 uppercase tracking-wider mb-2">
            <Zap size={16} />
            <span>Stress Trend</span>
          </div>
          <div className="text-xl font-medium text-zinc-50 capitalize">
            {insights.stressTrend}
          </div>
        </div>
        
        <div className="h-px w-full bg-white/10" />

        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">Recommendation</span>
          <p className="text-sm text-zinc-200">
            {insights.status === 'critical' ? 'Try the Relieve section for breathing exercises.' : 
             insights.status === 'warning' ? 'Take a short break to maintain balance.' : 
             'You are doing great! Keep it up.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
