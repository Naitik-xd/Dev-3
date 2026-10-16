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
  Clock
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 md:p-6 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
      
      {/* 3D Elevated Card Container - Fixed to never overflow or get cut on Windows display scaling */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-blue-950/20 my-auto flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)] overflow-hidden transition-all duration-300">
        
        {/* Subtle Ambient Glow Strip at Top */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 shrink-0" />

        {/* Top Header Section (pinned at top) */}
        <div className="pt-4 sm:pt-6 px-5 sm:px-8 pb-3 text-center relative shrink-0">
          {/* Top-right quick dismiss / cancel button */}
          <button
            onClick={onCancel}
            title="Cancel Generation"
            aria-label="Cancel Generation"
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 3D Elevated Icon Badge */}
          <div className="relative inline-flex items-center justify-center mb-2">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping opacity-40 duration-1000" />
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-600/30 ring-4 ring-blue-50">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-blue-100" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/60 text-[10px] sm:text-[11px] font-bold text-blue-700 mb-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Gemma 4 Intelligence Pipeline</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
              Generating Substitution Plan
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
              Resolving conflict-free teacher schedules with pedagogical proximity
            </p>
          </div>
        </div>

        {/* Middle Content Section - Scrollable if screen height is constrained on Windows */}
        <div className="px-5 sm:px-8 py-2 overflow-y-auto space-y-3 flex-1 min-h-0">
          
          {/* Progress Bar Strip */}
          <div className="space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-semibold text-slate-600">Optimization Progress</span>
              <span className="font-bold text-blue-600 tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Animated Pipeline Steps */}
          <div className="space-y-2">
            {STEPS.map((step, idx) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStepIndex === idx && !isCompleted;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                    isCompleted
                      ? 'bg-emerald-50/60 border-emerald-200/80 shadow-xs'
                      : isCurrent
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/10 shadow-xs'
                      : 'bg-slate-50/40 border-slate-200/60 opacity-60'
                  }`}
                >
                  {/* Status Indicator Icon */}
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-150">
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold">{step.id}</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] sm:text-xs font-bold leading-tight ${
                        isCompleted ? 'text-emerald-900' : isCurrent ? 'text-blue-900' : 'text-slate-600'
                      }`}>
                        {step.title}
                      </span>
                      {isCompleted && (
                        <span className="text-[9px] sm:text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                          DONE
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-blue-600 animate-pulse bg-blue-100/70 px-1.5 py-0.2 rounded">
                          WORKING
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Pinned Footer with Rate Limit notice & Cancel Button */}
        <div className="px-5 sm:px-8 py-3 bg-slate-50/90 border-t border-slate-200/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 font-mono">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Rate limit: 80 req / 5 hr</span>
            <span className="sm:hidden">80 req/5h</span>
          </div>

          <button
            onClick={onCancel}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all flex items-center gap-1.5 active:scale-95 shadow-xs bg-white"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel Request</span>
          </button>
        </div>

      </div>
    </div>
  );
};
