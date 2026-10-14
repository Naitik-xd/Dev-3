import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { AbsenceBasketView } from './components/AbsenceBasketView';
import { PlanView } from './components/PlanView';
import { MasterTimetableTab } from './components/MasterTimetableTab';
import { GemmaGenerationModal } from './components/GemmaGenerationModal';
import { AbsenceRecord, AbsenceScope, SubstitutionPlan } from './types';
import { TEACHERS } from './data/mockData';
import { generateSubstitutionPlan, ABSENCE_THRESHOLD_PERCENT } from './utils/solver';
import { requestSubstitutionPlan } from './services/api';
import { Users, ClipboardCheck, Calendar, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'absences' | 'plan' | 'timetable'>('absences');
  
  // Default demo state: 2 absent teachers (Primary English + Senior Physics) for instant demo
  const [absences, setAbsences] = useState<AbsenceRecord[]>([
    { teacherId: 'T01', scope: 'full', timestamp: Date.now() - 3600000 },
    { teacherId: 'T13', scope: 'full', timestamp: Date.now() - 1800000 },
  ]);

  const [plan, setPlan] = useState<SubstitutionPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGemmaModalOpen, setIsGemmaModalOpen] = useState(false);
  const [isBackendDone, setIsBackendDone] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingPlanRef = useRef<SubstitutionPlan | null>(null);

  // Generate initial plan on mount for the default 2 absent teachers
  useEffect(() => {
    const initialPlan = generateSubstitutionPlan(absences);
    setPlan(initialPlan);
  }, []);

  const handleAddAbsence = (teacherId: string, scope: AbsenceScope = 'full') => {
    setAbsences(prev => {
      const exists = prev.find(a => a.teacherId === teacherId);
      if (exists) {
        return prev.map(a => (a.teacherId === teacherId ? { ...a, scope } : a));
      }
      return [...prev, { teacherId, scope, timestamp: Date.now() }];
    });
  };

  const handleRemoveAbsence = (teacherId: string) => {
    setAbsences(prev => prev.filter(a => a.teacherId !== teacherId));
  };

  const handleUpdateScope = (teacherId: string, scope: AbsenceScope) => {
    setAbsences(prev =>
      prev.map(a => (a.teacherId === teacherId ? { ...a, scope } : a))
    );
  };

  const handleClearAll = () => {
    setAbsences([]);
    setPlan(null);
  };

  const handleReset = () => {
    // Reset to initial baseline of 2 absent teachers
    const defaultAbsences: AbsenceRecord[] = [
      { teacherId: 'T01', scope: 'full', timestamp: Date.now() },
      { teacherId: 'T13', scope: 'full', timestamp: Date.now() },
    ];
    setAbsences(defaultAbsences);
    const newPlan = generateSubstitutionPlan(defaultAbsences);
    setPlan(newPlan);
    setActiveTab('absences');
  };

  const handleGeneratePlan = async () => {
    if (absences.length === 0) return;

    setIsGenerating(true);
    setIsBackendDone(false);
    setIsGemmaModalOpen(true);
    pendingPlanRef.current = null;

    // Create abort controller for cancelability
    abortControllerRef.current = new AbortController();

    try {
      const resultPlan = await requestSubstitutionPlan(absences, abortControllerRef.current.signal);
      pendingPlanRef.current = resultPlan;
      setIsBackendDone(true);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('User cancelled Gemma generation request');
        setIsGemmaModalOpen(false);
        setIsGenerating(false);
        return;
      }
      console.error('Plan generation failed, using local solver:', err);
      const fallback = generateSubstitutionPlan(absences);
      pendingPlanRef.current = fallback;
      setIsBackendDone(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGemmaModalOpen(false);
    setIsGenerating(false);
    setIsBackendDone(false);
    pendingPlanRef.current = null;
  };

  const handleModalComplete = () => {
    if (pendingPlanRef.current) {
      setPlan(pendingPlanRef.current);
    }
    setIsGemmaModalOpen(false);
    setIsBackendDone(false);
    setActiveTab('plan');
  };

  // Manual teacher reassignment in the plan
  const handleSwapTeacher = (
    assignmentId: string,
    newSubstituteTeacherId: string,
    reason: string
  ) => {
    if (!plan) return;

    const updatedAssignments = plan.assignments.map(a => {
      if (a.id === assignmentId) {
        const sub = TEACHERS.find(t => t.id === newSubstituteTeacherId);
        const classWing = a.classId <= 5 ? 'primary' : a.classId <= 8 ? 'middle' : 'senior';
        return {
          ...a,
          substituteTeacherId: newSubstituteTeacherId,
          reason,
          wingMatch: sub?.wing === classWing,
          isManualOverride: true,
        };
      }
      return a;
    });

    setPlan({
      ...plan,
      assignments: updatedAssignments,
    });
  };

  const isOverThreshold = (absences.length / TEACHERS.length) * 100 > ABSENCE_THRESHOLD_PERCENT;
  const canGenerate = absences.length > 0 && !isOverThreshold && !isGenerating;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-20 sm:pb-8 w-full max-w-full overflow-x-hidden">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        absentCount={absences.length}
        totalAssignments={plan?.assignments.length || 0}
        onGenerateClick={handleGeneratePlan}
        canGenerate={canGenerate}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'absences' && (
          <AbsenceBasketView
            absences={absences}
            onAddAbsence={handleAddAbsence}
            onRemoveAbsence={handleRemoveAbsence}
            onUpdateScope={handleUpdateScope}
            onClearAll={handleClearAll}
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'plan' && (
          <PlanView
            plan={plan}
            onNavigateToAbsences={() => setActiveTab('absences')}
            onSwapTeacher={handleSwapTeacher}
            onRegenerate={handleGeneratePlan}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'timetable' && (
          <MasterTimetableTab activePlan={plan} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/80 backdrop-blur-xs py-6 px-4 text-center text-xs text-slate-500 space-y-1.5 mb-14 sm:mb-0">
        <p className="font-medium text-slate-600">
          This is made for HacktoberFest 26, and is currently in beta, so is not available for Public use.
        </p>
        <p className="flex items-center justify-center gap-1 text-slate-600">
          <span>Made with ❤️ by</span>
          <a
            href="https://Na1t1k.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Naitik
          </a>
        </p>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar (Thumb-zone optimized, <=15% height) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1">
        <div className="grid grid-cols-3 items-center h-14">
          <button
            onClick={() => setActiveTab('absences')}
            className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors relative ${
              activeTab === 'absences' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Absences</span>
            {absences.length > 0 && (
              <span className="absolute top-1 right-5 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-mono flex items-center justify-center">
                {absences.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors relative ${
              activeTab === 'plan' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Today's Plan</span>
            {(plan?.assignments.length ?? 0) > 0 && (
              <span className="absolute top-1 right-4 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-mono flex items-center justify-center">
                {plan?.assignments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors ${
              activeTab === 'timetable' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Timetable</span>
          </button>
        </div>
      </div>

      {/* Gemma 4 Intelligence Pipeline Modal */}
      <GemmaGenerationModal
        isOpen={isGemmaModalOpen}
        onCancel={handleCancelGeneration}
        onComplete={handleModalComplete}
        isBackendDone={isBackendDone}
      />
    </div>
  );
}
