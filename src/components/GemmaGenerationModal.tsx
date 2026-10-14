import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Calendar, 
  ShieldCheck, 
  Layers, 
  BrainCircuit, 
  X,
  AlertOctagon
} from 'lucide-react';

interface GemmaGenerationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onComplete: () => void;
  isBackendDone: boolean;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Analyzing 12-Class Master Timetable',
    description: 'Scanning 96 period slots across Primary, Middle, and Senior wings',
    icon: Calendar,
  },
  {
    id: 2,
    title: 'Enforcing Workload & 6-Lesson Shielding',
    description: 'Verifying 8-lesson cap and isolating faculty with >=6 regular periods',
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: 'Resolving Grade-Level Proximity Matches',
    description: 'Pairing vacancies with wing-adjacent faculty to maintain pedagogy',
    icon: Layers,
  },
  {
    id: 4,
    title: 'Gemma 4 Synthesizing Coordinator Briefing',
    description: 'Generating instructional continuity guidelines and assembly summary',
    icon: BrainCircuit,
  },
];

export const GemmaGenerationModal: React.FC<GemmaGenerationModalProps> = ({
  isOpen,
  onCancel,
  onComplete,
  isBackendDone,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setCompletedSteps([]);
      return;
    }

    // Step simulation timers to provide a transparent, engaging visual pipeline
    const timer1 = setTimeout(() => {
      setCompletedSteps(prev => [...prev, 1]);
      setCurrentStepIndex(1);
    }, 600);

    const timer2 = setTimeout(() => {
      setCompletedSteps(prev => [...prev, 2]);
      setCurrentStepIndex(2);
    }, 1300);

    const timer3 = setTimeout(() => {
      setCompletedSteps(prev => [...prev, 3]);
      setCurrentStepIndex(3);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen]);

  // When backend response arrives and animation has reached or can finish
  useEffect(() => {
    if (isBackendDone && isOpen) {
      setCompletedSteps([1, 2, 3, 4]);
      setCurrentStepIndex(4);
      const finalizeTimer = setTimeout(() => {
        onComplete();
      }, 700);
      return () => clearTimeout(finalizeTimer);
    }
  }, [isBackendDone, isOpen, onComplete]);

  if (!isOpen) return null;

  const progressPercent = Math.min(Math.round((completedSteps.length / STEPS.length) * 100), 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* 3D Elevated Card Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-blue-900/15 overflow-hidden transition-all duration-300 transform perspective-1000">
        
        {/* Subtle Ambient Glow Strip at Top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header with 3D Orbital Emblem */}
          <div className="text-center space-y-3">
            <div className="relative inline-flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-2xl bg-blue-500/15 animate-ping opacity-50 duration-1000" />
              
              {/* 3D Elevated Icon Badge */}
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 ring-4 ring-blue-50">
                <Sparkles className="w-7 h-7 animate-pulse text-blue-100" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[11px] font-bold text-blue-700 mb-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Gemma 4 Intelligence Pipeline</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Generating Substitution Plan
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Resolving conflict-free teacher schedules with pedagogical proximity
              </p>
            </div>
          </div>

          {/* Progress Bar Strip */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-semibold text-slate-600">Optimization Progress</span>
              <span className="font-bold text-blue-600 tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Animated Pipeline Steps */}
          <div className="space-y-3 pt-1">
            {STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStepIndex === idx && !isCompleted;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-all duration-200 flex items-start gap-3.5 ${
                    isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200/80'
                      : isCurrent
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/10 shadow-xs'
                      : 'bg-slate-50/40 border-slate-200/60 opacity-60'
                  }`}
                >
                  {/* Status Indicator Icon */}
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-150">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold">{step.id}</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold leading-tight ${
                        isCompleted ? 'text-emerald-900' : isCurrent ? 'text-blue-900' : 'text-slate-600'
                      }`}>
                        {step.title}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-mono font-semibold text-emerald-700">
                          DONE
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold text-blue-600 animate-pulse">
                          WORKING
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action: Cancel Button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500 font-mono">
              Press cancel to return to basket
            </span>

            <button
              onClick={onCancel}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <X className="w-4 h-4" />
              <span>Cancel Request</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
