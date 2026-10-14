import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { SubstitutionPlan } from '../types';
import { TEACHERS, CLASS_NAMES, PERIOD_TIMES, getTeacherById } from '../data/mockData';

interface WhatsAppModalProps {
  plan: SubstitutionPlan;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ plan, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Build structured WhatsApp message
  const absentStaffNames = plan.absences
    .map(a => {
      const teacher = getTeacherById(a.teacherId);
      const scopeLabel =
        a.scope === 'full' ? 'Full Day' : a.scope === 'morning' ? 'P1–4' : 'P5–8';
      return `• *${teacher?.name || a.teacherId}* (${scopeLabel})`;
    })
    .join('\n');

  // Group assignments by Period
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const assignmentsByPeriod = periods
    .map(p => {
      const slots = plan.assignments.filter(a => a.period === p);
      if (slots.length === 0) return null;

      const slotLines = slots
        .map(s => {
          const sub = getTeacherById(s.substituteTeacherId);
          const orig = getTeacherById(s.originalTeacherId);
          return `  ▸ *${CLASS_NAMES[s.classId]}* (${s.subject}): *${sub?.name}* (for ${orig?.name})`;
        })
        .join('\n');

      return `*PERIOD ${p}* (${PERIOD_TIMES[p]}):\n${slotLines}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const messageText = `📋 *DAILY TEACHER SUBSTITUTION ROSTER*
📅 *Date:* ${plan.date}
⏰ *Generated:* ${plan.createdAt}

⚠️ *ABSENT FACULTY:*
${absentStaffNames}

━━━━━━━━━━━━━━━━━━━━━
📖 *SUBSTITUTION ASSIGNMENTS:*

${assignmentsByPeriod}

━━━━━━━━━━━━━━━━━━━━━
ℹ️ *Coordinated via SubMaster System*
_Please report to assigned classes promptly._`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Share via WhatsApp</h3>
              <p className="text-xs text-slate-500">
                Dispatch substitution plan to faculty and staff broadcast groups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-slate-400 hover:text-slate-700 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Preview */}
        <div className="p-5 flex-1 overflow-y-auto">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Message Preview (Formatted for WhatsApp Markdown)
          </label>
          <div className="p-4 bg-emerald-50/40 border border-emerald-200/80 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
            {messageText}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
              copied
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Message</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="min-h-[44px] px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
