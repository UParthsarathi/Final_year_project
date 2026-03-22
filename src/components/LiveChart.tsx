import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { DataPoint } from '../store/useSensorStore';

interface LiveChartProps {
  data: DataPoint[];
  dataKey: keyof DataPoint;
  color?: string;
  title: string;
  yAxisDomain?: [number | 'dataMin', number | 'dataMax'];
}

export function LiveChart({
  data,
  dataKey,
  color = '#10b981',
  title,
  yAxisDomain = ['dataMin', 'dataMax'],
}: LiveChartProps) {
  return (
    <div className="glass-panel p-4 md:p-6 h-[250px] md:h-[300px] flex flex-col">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 md:mb-6">
        {title}
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) => format(new Date(tick), 'HH:mm:ss')}
              stroke="rgba(255,255,255,0.2)"
              fontSize={12}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis
              domain={yAxisDomain}
              stroke="rgba(255,255,255,0.2)"
              fontSize={12}
              tickFormatter={(val) => Math.round(val).toString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                color: '#fff',
              }}
              labelFormatter={(label) => format(new Date(label), 'HH:mm:ss')}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color-${dataKey})`}
              isAnimationActive={false} // Disable animation for real-time performance
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
