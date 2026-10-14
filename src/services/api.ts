import { AbsenceRecord, SubstitutionPlan } from '../types';
import { generateSubstitutionPlan } from '../utils/solver';

export async function requestSubstitutionPlan(
  absences: AbsenceRecord[],
  signal?: AbortSignal
): Promise<SubstitutionPlan> {
  try {
    const response = await fetch('/api/substitution/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ absences }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.plan) {
      return data.plan;
    }
    throw new Error('Invalid response structure from server');
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw error;
    }
    console.warn('Backend proxy call failed, using deterministic local solver engine:', error);
    // Instant, collision-free local fallback
    return generateSubstitutionPlan(absences);
  }
}
