import React from 'react';
import { useSensorStore } from '../store/useSensorStore';
import { MetricCard } from './MetricCard';
import { LiveChart } from './LiveChart';
import { Insights } from './Insights';
import { Activity, Heart, Zap } from 'lucide-react';

export function Dashboard() {
  const { currentStress, stressHistory } = useSensorStore();

  const stressLevel = currentStress ? Math.round(currentStress.weightedStress) : '--';
  
  // Determine stress status
  const getStressStatus = (level: number | string) => {
    if (typeof level === 'string') return 'normal';
    if (level > 70) return 'critical';
    if (level > 40) return 'warning';
    return 'normal';
  };

  const getStressLabel = (level: number | string) => {
    if (typeof level === 'string') return 'Calibrating...';
    if (level > 70) return 'High Stress';
    if (level > 40) return 'Moderate Stress';
    return 'Relaxed';
  };

  const stressStatus = typeof stressLevel === 'number' ? getStressStatus(stressLevel) : 'normal';
  const stressLabel = typeof stressLevel === 'number' ? getStressLabel(stressLevel) : 'Calibrating...';

  // Calculate trend from real data
  const recentStress = stressHistory.slice(-10).map(p => p.weightedStress);
  const stressTrend = recentStress.length > 1 
    ? (recentStress[recentStress.length - 1] > recentStress[0] ? 'up' : 'down') 
    : 'stable';

  // Prepare data for the stress chart
  const chartData = stressHistory.map(p => ({
    timestamp: p.timestamp,
    stress: p.weightedStress
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Metrics Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Main Stress Level - Primary Focus */}
        <div className="md:col-span-2 lg:col-span-6">
          <MetricCard
            title="Weighted Stress Level"
            value={stressLevel}
            unit="%"
            icon={<Zap className="text-amber-400" />}
            trend={stressTrend}
            trendValue={recentStress.length > 1 ? `${Math.abs(Math.round(recentStress[recentStress.length - 1] - recentStress[0]))}%` : undefined}
            status={stressStatus}
            className="h-full min-h-[220px]"
          />
        </div>

        {/* Component Scores - Sideways */}
        <div className="md:col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <MetricCard
            title="Objective Score"
            value={currentStress ? currentStress.objectiveScore.toFixed(1) : '--'}
            icon={<Activity className="text-blue-400" size={18} />}
            className="h-full"
          />
          <MetricCard
            title="Subjective Score"
            value={currentStress ? currentStress.subjectiveScore.toFixed(1) : '--'}
            icon={<Heart className="text-rose-400" size={18} />}
            className="h-full"
          />
        </div>

        {/* Stress State - Status Summary */}
        <div className="md:col-span-1 lg:col-span-3">
          <MetricCard
            title="Current State"
            value={stressLabel}
            icon={<Activity className="text-indigo-400" size={18} />}
            status={stressStatus}
            className="h-full"
          />
        </div>
      </div>

      {/* Insights Section */}
      <Insights />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <LiveChart
          title="Stress Level Over Time (%)"
          data={chartData}
          dataKey="stress"
          color="#6366f1" // indigo-500
          yAxisDomain={[0, 100]}
        />
      </div>
    </div>
  );
}
