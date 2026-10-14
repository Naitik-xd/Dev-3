import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { generateSubstitutionPlan } from '../../src/utils/solver.ts';
import { AbsenceRecord } from '../../src/types/index.ts';
import { TEACHERS, CLASS_NAMES } from '../../src/data/mockData.ts';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { absences } = req.body as { absences: AbsenceRecord[] };
    if (!absences || !Array.isArray(absences)) {
      return res.status(400).json({ error: 'Absences array is required' });
    }

    const plan = generateSubstitutionPlan(absences);

    if (plan.isOverThreshold) {
      return res.json({ plan });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && plan.assignments.length > 0) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: { 'User-Agent': 'aistudio-build' },
          },
        });

        const absentSummary = absences
          .map(a => {
            const teacher = TEACHERS.find(t => t.id === a.teacherId);
            return `${teacher?.name || a.teacherId} (${a.scope} absence)`;
          })
          .join(', ');

        const assignmentDetails = plan.assignments
          .map(as => {
            const orig = TEACHERS.find(t => t.id === as.originalTeacherId)?.name;
            const sub = TEACHERS.find(t => t.id === as.substituteTeacherId)?.name;
            return `P${as.period} (${CLASS_NAMES[as.classId]} ${as.subject}): ${orig} covered by ${sub} [${as.reason}]`;
          })
          .join('\n');

        const prompt = `You are the lead academic coordinator intelligence engine powered by Gemma 4 for a K-12 school (Classes 1-12, 8 periods/day).
The following daily substitution assignments were resolved under strict workload constraints (max 8 lessons, no assignments to teachers with >=6 base lessons, and grade-level proximity prioritized):

ABSENT STAFF:
${absentSummary}

ASSIGNMENTS:
${assignmentDetails}

Provide two concise outputs:
1. "briefing": A sharp 2-sentence executive summary for the morning assembly coordinator regarding coverage stability and workload health.
2. "continuityTips": 2-3 brief practical bullet points for pedagogical continuity and supervision handovers.

Respond strictly in valid JSON format:
{
  "briefing": "...",
  "continuityTips": "..."
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-4-argon',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const text = response.text;
        if (text) {
          try {
            const parsed = JSON.parse(text);
            plan.aiSummary = parsed.briefing || plan.aiSummary;
            plan.aiContinuityNotes = parsed.continuityTips || undefined;
          } catch {
            plan.aiSummary = text.trim();
          }
        }
      } catch (err) {
        console.warn('Gemma 4 generation fallback in serverless handler:', err);
      }
    }

    return res.json({ plan });
  } catch (err) {
    console.error('Serverless error generating substitution plan:', err);
    return res.status(500).json({ error: 'Failed to generate substitution plan' });
  }
}
