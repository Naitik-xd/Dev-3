import React from 'react';
import { Users, Calendar, ClipboardCheck, ArrowRight, RotateCcw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'absences' | 'plan' | 'timetable';
  setActiveTab: (tab: 'absences' | 'plan' | 'timetable') => void;
  absentCount: number;
  totalAssignments: number;
  onGenerateClick?: () => void;
  canGenerate: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  absentCount,
  totalAssignments,
  onGenerateClick,
  canGenerate,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              S
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                SubMaster
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:block">
                Classes 1–12 Substitution Engine
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs (Shown on md+ screens; mobile uses bottom tab bar) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('absences')}
              className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'absences'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Absence Basket</span>
              {absentCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[11px] font-mono font-bold bg-blue-600 text-white rounded-full">
                  {absentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'plan'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 shrink-0" />
              <span>Today's Plan</span>
              {totalAssignments > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[11px] font-mono font-bold bg-emerald-600 text-white rounded-full">
                  {totalAssignments}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`min-h-[44px] px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'timetable'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Master Timetable</span>
              <span className="md:hidden">Timetable</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action / Reset */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReset}
              title="Reset Roster & Clear Absences"
              className="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center text-xs font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1.5">Reset</span>
            </button>

            {activeTab === 'absences' && onGenerateClick && (
              <button
                onClick={onGenerateClick}
                disabled={!canGenerate}
                className={`min-h-[44px] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                  canGenerate
                    ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Generate Plan</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
