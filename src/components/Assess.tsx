import React from 'react';
import { ClipboardList, Clock, ArrowRight } from 'lucide-react';

export function Assess() {
  const questionnaires = [
    {
      id: 'daily',
      title: 'Daily Check-in',
      description: 'A quick 1-minute assessment of your current mood, energy, and stress levels.',
      time: '1 min',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'pss',
      title: 'Perceived Stress Scale (PSS)',
      description: 'The most widely used psychological instrument for measuring the perception of stress.',
      time: '3 min',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      id: 'gad7',
      title: 'Anxiety Screener (GAD-7)',
      description: 'A brief clinical questionnaire for screening and measuring generalized anxiety.',
      time: '2 min',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 'sleep',
      title: 'Sleep Quality Index',
      description: 'Evaluate your sleep patterns, disturbances, and overall restfulness.',
      time: '4 min',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-panel p-8 text-center max-w-2xl mx-auto">
        <ClipboardList className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-zinc-50 mb-2">Clinical Assessments</h2>
        <p className="text-zinc-400">
          Regular self-reporting combined with your physiological data provides a complete picture of your mental wellness. Select an assessment to begin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {questionnaires.map((q) => (
          <div key={q.id} className="glass-panel p-6 flex flex-col h-full hover:bg-white/[0.02] transition-colors cursor-pointer group">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-4 w-fit ${q.color}`}>
              <Clock size={12} />
              {q.time}
            </div>
            <h3 className="text-xl font-medium text-zinc-100 mb-2">{q.title}</h3>
            <p className="text-zinc-400 text-sm flex-1 mb-6 leading-relaxed">
              {q.description}
            </p>
            <div className="flex items-center text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
              Start Assessment <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
