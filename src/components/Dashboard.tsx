import React from 'react';
import { useSensorStore } from '../store/useSensorStore';
import { MetricCard } from './MetricCard';
import { LiveChart } from './LiveChart';
import { Insights } from './Insights';
import { Activity, Heart, Zap } from 'lucide-react';

export function Dashboard() {
  const { current, history } = useSensorStore();

  // Calculate some basic trends for the cards
  const recentBpm = history.slice(-10).map(p => p.bpm);
  const bpmTrend = recentBpm.length > 1 
    ? (recentBpm[recentBpm.length - 1] > recentBpm[0] ? 'up' : 'down') 
    : 'stable';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Heart Rate"
          value={current?.bpm || '--'}
          unit="bpm"
          icon={<Heart className="text-rose-400" />}
          trend={bpmTrend}
          trendValue={current ? `${Math.abs(current.bpm - (recentBpm[0] || current.bpm))} bpm` : undefined}
          status={current?.bpm === 0 ? 'warning' : current && current.bpm > 100 ? 'critical' : 'normal'}
        />
        <MetricCard
          title="Electrodermal Activity"
          value={current?.eda.toFixed(2) || '--'}
          unit="µS"
          icon={<Zap className="text-amber-400" />}
          trend="stable"
          status="normal"
        />
        <MetricCard
          title="HRV (Est)"
          value={current ? Math.round(60 + Math.random() * 10) : '--'}
          unit="ms"
          icon={<Activity className="text-emerald-400" />}
          trend="up"
          trendValue="2 ms"
          status="normal"
        />
      </div>

      {/* Insights Section */}
      <Insights />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveChart
          title="Heart Rate (BPM)"
          data={history}
          dataKey="bpm"
          color="#f43f5e" // rose-500
          yAxisDomain={[40, 180]}
        />
        <LiveChart
          title="Electrodermal Activity (µS)"
          data={history}
          dataKey="eda"
          color="#f59e0b" // amber-500
          yAxisDomain={[0, 10]}
        />
      </div>
    </div>
  );
}
