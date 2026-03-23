import React, { useState } from 'react';
import { ClipboardList, ArrowRight, ArrowLeft, CheckCircle2, Activity, Brain, HeartPulse, Gauge, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, auth } from '../lib/firebase';

type Step = 'menu' | 'vas' | 'sam' | 'nasa' | 'stai' | 'complete';

export function Assess() {
  const [step, setStep] = useState<Step>('menu');
  
  // State for VAS
  const [vas, setVas] = useState<number>(5);
  
  // State for SAM
  const [sam, setSam] = useState({ valence: 5, arousal: 5 });
  
  // State for NASA-TLX
  const [nasa, setNasa] = useState({
    mental: 50, physical: 50, temporal: 50, performance: 50, effort: 50, frustration: 50
  });
  
  // State for STAI-S (1-4 scale)
  const [stai, setStai] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const staiQuestions = [
    { id: 'q1', text: 'I feel calm' },
    { id: 'q2', text: 'I am tense' },
    { id: 'q3', text: 'I feel upset' },
    { id: 'q4', text: 'I am relaxed' },
    { id: 'q5', text: 'I feel content' },
    { id: 'q6', text: 'I am worried' },
  ];

  const handleNavigate = (nextStep: Step) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitAssessment = async (type: Step) => {
    setIsSubmitting(true);
    try {
      const username = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'anonymous';
      let payload: any = {};

      if (type === 'vas') {
        payload = {
          finalScore: vas,
          normalizedScore: vas * 10,
          inference: `Based on the Single-item Stress (VAS) questionnaire, your current stress level is ${vas < 4 ? 'low' : vas < 7 ? 'moderate' : 'high'}.`,
          questionnaire: "Single-item Stress (VAS)",
          questionnaireName: "Single-item Stress (VAS)",
          questionnaireSlug: "stress-vas",
          rawScores: { stress: vas }
        };
      } else if (type === 'sam') {
        payload = {
          finalScore: sam.arousal,
          normalizedScore: Math.round((sam.arousal / 9) * 100),
          inference: `Based on the SAM questionnaire, you are feeling ${sam.valence > 5 ? 'positive' : 'negative'} with ${sam.arousal > 5 ? 'high' : 'low'} arousal.`,
          questionnaire: "Self-Assessment Manikin (SAM)",
          questionnaireName: "Self-Assessment Manikin (SAM)",
          questionnaireSlug: "sam",
          rawScores: { valence: sam.valence, arousal: sam.arousal }
        };
      } else if (type === 'nasa') {
        const avg = Math.round((nasa.mental + nasa.physical + nasa.temporal + nasa.performance + nasa.effort + nasa.frustration) / 6);
        payload = {
          finalScore: avg,
          normalizedScore: avg,
          inference: `Based on the NASA-TLX questionnaire, your perceived workload is ${avg < 33 ? 'low' : avg < 66 ? 'moderate' : 'high'}.`,
          questionnaire: "NASA-TLX Short Form",
          questionnaireName: "NASA-TLX Short Form",
          questionnaireSlug: "nasa-tlx",
          rawScores: { ...nasa }
        };
      } else if (type === 'stai') {
        // Reverse score positive items: q1, q4, q5
        const q1 = 5 - (stai.q1 || 1);
        const q2 = stai.q2 || 1;
        const q3 = stai.q3 || 1;
        const q4 = 5 - (stai.q4 || 1);
        const q5 = 5 - (stai.q5 || 1);
        const q6 = stai.q6 || 1;
        const score = q1 + q2 + q3 + q4 + q5 + q6;
        
        payload = {
          finalScore: score,
          normalizedScore: Math.round(((score - 6) / 18) * 100),
          inference: `Based on the Short STAI-S questionnaire, your state anxiety is ${score < 12 ? 'low' : score < 18 ? 'moderate' : 'high'}.`,
          questionnaire: "Short STAI-S",
          questionnaireName: "Short STAI-S",
          questionnaireSlug: "stai-s",
          rawScores: { ...stai }
        };
      }

      const fullPayload = {
        ...payload,
        submittedAt: serverTimestamp(),
        username
      };

      await addDoc(collection(firestore, 'submissions'), fullPayload);
      handleNavigate('complete');
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSlider = (
    label: string, 
    description: string, 
    value: number, 
    onChange: (val: number) => void, 
    minLabel: string, 
    maxLabel: string, 
    min = 0, 
    max = 100, 
    step = 1
  ) => (
    <div className="mb-8 bg-white p-6 rounded-2xl border border-[#E5E5E0] shadow-sm">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h4 className="text-lg font-medium text-[#1A1A1A]">{label}</h4>
          <p className="text-sm text-zinc-500 mt-1">{description}</p>
        </div>
        <span className="text-2xl font-mono font-bold text-[#5A5A40]">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#5A5A40] mt-4"
      />
      <div className="flex justify-between text-xs font-medium text-zinc-500 mt-3 uppercase tracking-wider">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );

  const assessments = [
    {
      id: 'vas' as Step,
      title: 'Single-item Stress (VAS)',
      description: 'A quick assessment of current stress level using a Visual Analog Scale.',
      time: '< 1 min',
      icon: Activity,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'sam' as Step,
      title: 'Self-Assessment Manikin (SAM)',
      description: 'Measures the affective dimensions of valence (pleasure) and arousal (calmness).',
      time: '1 min',
      icon: HeartPulse,
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      id: 'nasa' as Step,
      title: 'NASA-TLX Short Form',
      description: 'A widely used tool for assessing perceived workload across six dimensions.',
      time: '2 min',
      icon: Brain,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    },
    {
      id: 'stai' as Step,
      title: 'Short STAI-S',
      description: 'A 6-item scale used to measure current (state) anxiety levels.',
      time: '2 min',
      icon: Gauge,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <AnimatePresence mode="wait">
        
        {/* MENU STEP */}
        {step === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="glass-panel p-8 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-[#5A5A40]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#5A5A40]/20">
                <ClipboardList className="w-8 h-8 text-[#5A5A40]" />
              </div>
              <h2 className="text-3xl font-serif font-medium text-[#2D2D2A] mb-2">Clinical Assessments</h2>
              <p className="text-zinc-500">
                Select an assessment to evaluate your cognitive load, emotional state, or perceived stress.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assessments.map((a) => (
                <div 
                  key={a.id} 
                  onClick={() => handleNavigate(a.id)}
                  className="glass-panel p-6 flex flex-col h-full hover:bg-black/[0.02] transition-colors cursor-pointer group border border-[#E5E5E0] hover:border-[#5A5A40]/30"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-xl border", a.color)}>
                      <a.icon size={24} />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500 border border-[#E5E5E0]">
                      <Clock size={12} />
                      {a.time}
                    </div>
                  </div>
                  <h3 className="text-xl font-medium text-[#1A1A1A] mb-2">{a.title}</h3>
                  <p className="text-zinc-500 text-sm flex-1 mb-6 leading-relaxed">
                    {a.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-[#5A5A40] group-hover:text-[#4A4A30] transition-colors">
                    Start Assessment <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VAS STEP */}
        {step === 'vas' && (
          <motion.div key="vas" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-medium text-[#2D2D2A]">Single-item Stress (VAS)</h2>
              <p className="text-zinc-500 mt-2">A quick assessment of current stress level using a Visual Analog Scale (typically rated 0–10).</p>
            </div>
            
            <div className="glass-panel p-6 md:p-10 mb-8">
              <h3 className="text-xl text-[#1A1A1A] mb-12 text-center font-medium">Please rate your current stress level on a scale from 0 (no stress) to 10 (extreme stress).</h3>
              
              <div className="relative pt-10 pb-8">
                {/* Visual gradient indicator */}
                <div className="absolute top-0 left-0 w-full h-4 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-20" />
                
                <div className="text-center mb-6">
                  <span className="text-6xl font-bold text-[#1A1A1A]">{vas}</span>
                </div>

                <input
                  type="range" min="0" max="10" value={vas}
                  onChange={(e) => setVas(Number(e.target.value))}
                  className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
                />
                <div className="flex justify-between text-sm font-medium text-zinc-500 mt-4 uppercase tracking-wider">
                  <span>0 (No stress)</span>
                  <span>10 (Extreme stress)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => handleNavigate('menu')} disabled={isSubmitting} className="px-6 py-3 rounded-full border border-[#E5E5E0] text-zinc-600 hover:bg-black/5 flex items-center gap-2 bg-white">
                <ArrowLeft size={18} /> Cancel
              </button>
              <button onClick={() => submitAssessment('vas')} disabled={isSubmitting} className="bg-[#5A5A40] hover:bg-[#4A4A30] disabled:opacity-50 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Submit <CheckCircle2 size={18} /></>}
              </button>
            </div>
          </motion.div>
        )}

        {/* SAM STEP */}
        {step === 'sam' && (
          <motion.div key="sam" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-medium text-[#2D2D2A]">Self-Assessment Manikin (SAM)</h2>
              <p className="text-zinc-500 mt-2">Measures the affective dimensions of valence (pleasure) and arousal (calmness) on a 1–9 scale.</p>
            </div>
            
            <div className="glass-panel p-6 md:p-8 mb-8">
              {renderSlider('Valence (Pleasure)', 'How pleasant or unpleasant do you feel?', sam.valence, (v) => setSam({...sam, valence: v}), '1 (Very unpleasant)', '9 (Very pleasant)', 1, 9)}
              {renderSlider('Arousal (Calmness)', 'How aroused or calm do you feel?', sam.arousal, (v) => setSam({...sam, arousal: v}), '1 (Very calm)', '9 (Very aroused)', 1, 9)}
            </div>

            <div className="flex justify-between">
              <button onClick={() => handleNavigate('menu')} disabled={isSubmitting} className="px-6 py-3 rounded-full border border-[#E5E5E0] text-zinc-600 hover:bg-black/5 flex items-center gap-2 bg-white">
                <ArrowLeft size={18} /> Cancel
              </button>
              <button onClick={() => submitAssessment('sam')} disabled={isSubmitting} className="bg-[#5A5A40] hover:bg-[#4A4A30] disabled:opacity-50 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Submit <CheckCircle2 size={18} /></>}
              </button>
            </div>
          </motion.div>
        )}

        {/* NASA-TLX STEP */}
        {step === 'nasa' && (
          <motion.div key="nasa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-medium text-[#2D2D2A]">NASA-TLX Short Form</h2>
              <p className="text-zinc-500 mt-2">A widely used tool for assessing perceived workload across six dimensions.</p>
            </div>
            
            <div className="glass-panel p-6 md:p-8 mb-8">
              {renderSlider('Mental Demand', 'How mentally demanding was the task?', nasa.mental, (v) => setNasa({...nasa, mental: v}), 'Very Low', 'Very High', 0, 100, 5)}
              {renderSlider('Physical Demand', 'How physically demanding was the task?', nasa.physical, (v) => setNasa({...nasa, physical: v}), 'Very Low', 'Very High', 0, 100, 5)}
              {renderSlider('Temporal Demand', 'How hurried or rushed was the pace of the task?', nasa.temporal, (v) => setNasa({...nasa, temporal: v}), 'Very Low', 'Very High', 0, 100, 5)}
              {renderSlider('Effort', 'How hard did you have to work to accomplish your level of performance?', nasa.effort, (v) => setNasa({...nasa, effort: v}), 'Very Low', 'Very High', 0, 100, 5)}
              {renderSlider('Performance', 'How successful were you in accomplishing what you were asked to do?', nasa.performance, (v) => setNasa({...nasa, performance: v}), 'Perfect', 'Failure', 0, 100, 5)}
              {renderSlider('Frustration', 'How insecure, discouraged, irritated, stressed, and annoyed were you?', nasa.frustration, (v) => setNasa({...nasa, frustration: v}), 'Very Low', 'Very High', 0, 100, 5)}
            </div>

            <div className="flex justify-between">
              <button onClick={() => handleNavigate('menu')} disabled={isSubmitting} className="px-6 py-3 rounded-full border border-[#E5E5E0] text-zinc-600 hover:bg-black/5 flex items-center gap-2 bg-white">
                <ArrowLeft size={18} /> Cancel
              </button>
              <button onClick={() => submitAssessment('nasa')} disabled={isSubmitting} className="bg-[#5A5A40] hover:bg-[#4A4A30] disabled:opacity-50 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Submit <CheckCircle2 size={18} /></>}
              </button>
            </div>
          </motion.div>
        )}

        {/* STAI-S STEP */}
        {step === 'stai' && (
          <motion.div key="stai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-8">
              <h2 className="text-3xl font-serif font-medium text-[#2D2D2A]">Short STAI-S</h2>
              <p className="text-zinc-500 mt-2">A 6-item scale used to measure current (state) anxiety levels. Each item is typically rated on a scale of "Not at all" to "Very much so."</p>
            </div>
            
            <div className="glass-panel p-6 md:p-8 mb-8 space-y-8">
              {staiQuestions.map((q) => (
                <div key={q.id} className="bg-white p-6 rounded-2xl border border-[#E5E5E0] shadow-sm">
                  <h4 className="text-lg font-medium text-[#1A1A1A] mb-4">{q.text}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Not at all', 'Somewhat', 'Moderately so', 'Very much so'].map((label, index) => {
                      const value = index + 1;
                      const isSelected = stai[q.id] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => setStai({ ...stai, [q.id]: value })}
                          className={cn(
                            "p-3 rounded-xl text-sm font-medium transition-all border",
                            isSelected 
                              ? "bg-[#5A5A40]/10 border-[#5A5A40]/30 text-[#5A5A40]" 
                              : "bg-zinc-50 border-[#E5E5E0] text-zinc-500 hover:bg-zinc-100 hover:text-[#1A1A1A]"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button onClick={() => handleNavigate('menu')} disabled={isSubmitting} className="px-6 py-3 rounded-full border border-[#E5E5E0] text-zinc-600 hover:bg-black/5 flex items-center gap-2 bg-white">
                <ArrowLeft size={18} /> Cancel
              </button>
              <button 
                disabled={Object.keys(stai).length < 6 || isSubmitting}
                onClick={() => submitAssessment('stai')} 
                className="bg-[#5A5A40] hover:bg-[#4A4A30] disabled:opacity-50 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Submit <CheckCircle2 size={18} /></>}
              </button>
            </div>
          </motion.div>
        )}

        {/* COMPLETE STEP */}
        {step === 'complete' && (
          <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-12 text-center">
            <div className="w-24 h-24 bg-[#5A5A40]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#5A5A40]/20">
              <CheckCircle2 className="w-12 h-12 text-[#5A5A40]" />
            </div>
            <h2 className="text-3xl font-serif font-medium text-[#2D2D2A] mb-4">Assessment Complete</h2>
            <p className="text-zinc-500 text-lg mb-8 max-w-md mx-auto">
              Your responses have been recorded. This subjective data will be correlated with your physiological PPG and EDA metrics to provide deeper insights.
            </p>
            <button 
              onClick={() => {
                setStep('menu');
                setVas(5);
                setSam({ valence: 5, arousal: 5 });
                setNasa({ mental: 50, physical: 50, temporal: 50, performance: 50, effort: 50, frustration: 50 });
                setStai({});
              }}
              className="px-8 py-3 rounded-full border border-[#E5E5E0] text-zinc-600 hover:bg-black/5 font-medium bg-white"
            >
              Back to Assessments
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
