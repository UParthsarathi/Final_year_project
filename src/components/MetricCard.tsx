import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  className?: string;
  status?: 'normal' | 'warning' | 'critical';
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  className,
  status = 'normal',
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card p-6 flex flex-col justify-between relative overflow-hidden', className)}
    >
      {/* Subtle background glow based on status */}
      <div
        className={cn(
          'absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-1000',
          status === 'normal' && 'bg-emerald-500',
          status === 'warning' && 'bg-amber-500',
          status === 'critical' && 'bg-rose-500'
        )}
      />

      <div className="flex items-center justify-between mb-4 z-10">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-zinc-500">{icon}</div>}
      </div>

      <div className="z-10">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-zinc-50">
            {value}
          </span>
          {unit && <span className="text-lg text-zinc-500 font-medium">{unit}</span>}
        </div>

        {trendValue && (
          <div className="mt-3 flex items-center gap-1.5 text-sm font-medium">
            {trend === 'up' && <span className="text-rose-400">â</span>}
            {trend === 'down' && <span className="text-emerald-400">â</span>}
            {trend === 'stable' && <span className="text-zinc-400">â</span>}
            <span
              className={cn(
                trend === 'up' && 'text-rose-400',
                trend === 'down' && 'text-emerald-400',
                trend === 'stable' && 'text-zinc-400'
              )}
            >
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
