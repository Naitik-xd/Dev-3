import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generateSubstitutionPlan } from './src/utils/solver.ts';
import { AbsenceRecord } from './src/types/index.ts';
import { TEACHERS, CLASS_NAMES } from './src/data/mockData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize server-side Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    model: 'gemini-4-argon',
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Generate substitution plan with Gemma 4
app.post('/api/substitution/generate', async (req: Request, res: Response) => {
  try {
    const { absences } = req.body as { absences: AbsenceRecord[] };

    if (!absences || !Array.isArray(absences)) {
      return res.status(400).json({ error: 'Absences array is required' });
    }

    // 1. Run deterministic constraint-satisfaction solver
    const plan = generateSubstitutionPlan(absences);

    // If absence threshold exceeded (>50%), return immediately
    if (plan.isOverThreshold) {
      return res.json({ plan });
    }

    // 2. Enhance with Gemma 4 model if API key is present
    if (ai && plan.assignments.length > 0) {
      try {
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

${plan.uncoveredSlots.length > 0 ? `UNCOVERED SLOTS: ${plan.uncoveredSlots.length}` : 'All vacant slots safely covered.'}

Provide two concise outputs:
1. "briefing": A sharp 2-sentence executive summary for the morning assembly coordinator regarding coverage stability and workload health.
2. "continuityTips": 2-3 brief practical bullet points for pedagogical continuity and supervision handovers.

Respond strictly in valid JSON format:
{
  "briefing": "...",
  "continuityTips": "..."
}`;

        // Call Gemma 4 (mapped to 'gemini-4-argon')
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
      } catch (aiErr) {
        console.warn('Gemma 4 model generation error (falling back to deterministic plan):', aiErr);
        // Fallback note
        plan.aiSummary = `Plan verified by SubMaster Engine: ${plan.assignments.length} substitutions scheduled across ${new Set(plan.assignments.map(a => a.classId)).size} classes with grade-level proximity matching.`;
      }
    }

    return res.json({ plan });
  } catch (error) {
    console.error('Error generating substitution plan:', error);
    return res.status(500).json({ error: 'Failed to generate substitution plan' });
  }
});

// Configure Vite in dev mode or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SubMaster server running on http://localhost:${PORT}`);
  });
}

startServer();
