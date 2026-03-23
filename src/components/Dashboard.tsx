import React, { useEffect, useState } from 'react';
import { MetricCard } from './MetricCard';
import { LiveChart } from './LiveChart';
import { Brain } from 'lucide-react';
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

interface StressScoreData {
  device_id: string;
  timestamp: number;
  weighted_stress: number;
  objective_score: number;
  subjective_score: number;
}

export function Dashboard() {
  const [latestScore, setLatestScore] = useState<StressScoreData | null>(null);
  const [history, setHistory] = useState<StressScoreData[]>([]);

  useEffect(() => {
    // Listen to the last 50 stress scores for the chart/trend
    const stressRef = query(ref(db, 'readings/stress_score'), limitToLast(50));
    
    const unsubscribe = onValue(stressRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const scores: StressScoreData[] = Object.values(data);
        
        // Sort by timestamp just in case
        scores.sort((a, b) => a.timestamp - b.timestamp);
        
        setHistory(scores);
        setLatestScore(scores[scores.length - 1]);
      }
    });

    return () => unsubscribe();
  }, []);

  const getStatus = (score: number) => {
    if (score < 30) return 'normal';
    if (score < 60) return 'warning';
    return 'critical';
  };

  const getTrend = () => {
    if (history.length < 2) return 'stable';
    const current = history[history.length - 1].weighted_stress;
    const previous = history[history.length - 2].weighted_stress;
    if (current > previous + 2) return 'up';
    if (current < previous - 2) return 'down';
    return 'stable';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Metrics - Only Stress Score */}
      <div className="grid grid-cols-1 gap-6">
        <MetricCard
          title="Current Stress Score"
          value={latestScore ? latestScore.weighted_stress.toFixed(1) : '--'}
          unit="/ 100"
          icon={<Brain className="text-indigo-400" />}
          trend={getTrend()}
          trendValue={history.length >= 2 ? `${Math.abs(history[history.length - 1].weighted_stress - history[history.length - 2].weighted_stress).toFixed(1)} pts` : undefined}
          status={latestScore ? getStatus(latestScore.weighted_stress) : 'normal'}
        />
      </div>

      {/* Details Section */}
      {latestScore && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Objective Score (Physiological)</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-mono font-bold text-zinc-100">{latestScore.objective_score.toFixed(1)}</span>
              <span className="text-zinc-500 mb-1">/ 100</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000" 
                style={{ width: `${Math.min(100, Math.max(0, latestScore.objective_score))}%` }}
              />
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Subjective Score (Self-Reported)</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-mono font-bold text-zinc-100">{latestScore.subjective_score.toFixed(1)}</span>
              <span className="text-zinc-500 mb-1">/ 100</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000" 
                style={{ width: `${Math.min(100, Math.max(0, latestScore.subjective_score))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <LiveChart
            title="Stress Score History"
            data={history}
            dataKey="weighted_stress"
            color="#818cf8" // indigo-400
            yAxisDomain={[0, 100]}
          />
        </div>
      )}
    </div>
  );
}
