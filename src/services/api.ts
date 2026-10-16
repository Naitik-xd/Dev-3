import { AbsenceRecord, SubstitutionPlan } from '../types';
import { generateSubstitutionPlan } from '../utils/solver';

export async function requestSubstitutionPlan(
  absences: AbsenceRecord[],
  signal?: AbortSignal,
  forceContingency = false
): Promise<SubstitutionPlan> {
  try {
    const basePlan = generateSubstitutionPlan(absences, undefined, undefined, forceContingency);
    const response = await fetch('/api/substitution/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ absences, forceContingency, plan: basePlan }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.plan) {
      // Overwrite server timestamp with user's exact client device local time and date
      const clientNow = new Date();
      data.plan.createdAt = clientNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      data.plan.date = clientNow.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
      data.plan.generatedAtTimestamp = Date.now();
      if (data.rateLimit) {
        data.plan.rateLimit = data.rateLimit;
      }
      return data.plan;
    }
    throw new Error('Invalid response structure from server');
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw error;
    }
    console.warn('Backend proxy call failed, using deterministic local solver engine:', error);
    // Instant, collision-free local fallback
    return generateSubstitutionPlan(absences, undefined, undefined, forceContingency);
  }
}

export async function fetchRateLimitStatus(): Promise<import('../types').RateLimitInfo | null> {
  try {
    const res = await fetch('/api/substitution/rate-limit');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return null;
}
