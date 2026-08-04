import { auth } from '../firebase';
import { DailyLog, UserProfile } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV
    ? 'http://localhost:8000/api/v1'
    : 'https://api.reconexaoessencial.com.br/api/v1');

interface ApiEnvelope<T> {
  data: T | null;
  meta: {
    requestId: string;
    schemaVersion: string;
  };
  errors: Array<{
    code: string;
    message: string;
    field?: string | null;
    details?: unknown;
  }>;
}

interface BackendJournalEntry {
  id: string;
  entryDate: string;
  energyLevel: number | null;
  presenceLevel: number | null;
  meals: Array<{ mealType: string; description?: string | null }>;
  waterIntakeLabel?: string | null;
  reflections: {
    emanacoesAlmaText?: string | null;
    sincronicidadesText?: string | null;
  } | null;
}

export interface BackendProgress {
  id: string;
  userId: string;
  moduleSlug: string;
  status: 'locked' | 'in_progress' | 'done';
  progressPercent: number;
  lastSeenAt?: string | null;
  updatedAt: string;
}

export interface BackendFastingSession {
  id: string;
  userId: string;
  selectedWindowLabel: string;
  selectedWindowHours: number;
  startedAt: string;
  endedAt?: string | null;
  status: 'active' | 'completed' | 'interrupted';
  source: string;
  createdAt: string;
  updatedAt: string;
}

function buildUrl(path: string): string {
  const trimmedBase = API_BASE_URL.replace(/\/+$/g, '');
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

async function ensureBackendUser(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  await syncUserWithBackend({
    email: user.email || undefined,
    name: user.displayName || undefined,
    photoURL: user.photoURL || undefined,
    phone: user.phoneNumber || undefined,
  });
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed ${response.status} ${response.statusText}: ${text}`);
  }

  const envelope = await response.json() as ApiEnvelope<T>;
  if (envelope.errors?.length) {
    throw new Error(envelope.errors.map((error) => error.message).join('; '));
  }
  return envelope.data as T;
}

function waterLabelToGlasses(label?: string | null): number {
  if (!label) return 0;
  if (label === 'Mais de 5 copos') return 6;
  const match = label.match(/^(\d+) copos?/);
  return match ? Number(match[1]) : 0;
}

function toJournalPayload(log: DailyLog) {
  const meals = [] as Array<{ mealType: string; description?: string | null }>;
  if (log.foodRecord?.breakfast) {
    meals.push({ mealType: 'desjejum', description: log.foodRecord.breakfast });
  }
  if (log.foodRecord?.lunch) {
    meals.push({ mealType: 'almoco', description: log.foodRecord.lunch });
  }
  if (log.foodRecord?.dinner) {
    meals.push({ mealType: 'jantar', description: log.foodRecord.dinner });
  }
  if (log.foodRecord?.snacks) {
    meals.push({ mealType: 'lanches', description: log.foodRecord.snacks });
  }

  const reflections = {
    emanacoesAlmaText: log.reflection || null,
    sincronicidadesText: log.shadowObservations || log.synchronicities || null,
  };

  return {
    entryDate: log.date,
    energyLevel: log.energyLevel,
    presenceLevel: log.awarenessLevel,
    waterIntakeLabel:
      log.foodRecord?.waterGlasses
        ? log.foodRecord.waterGlasses > 5
          ? 'Mais de 5 copos'
          : `${log.foodRecord.waterGlasses} ${log.foodRecord.waterGlasses === 1 ? 'copo' : 'copos'}`
        : null,
    meals,
    reflections: reflections.emanacoesAlmaText || reflections.sincronicidadesText ? reflections : null,
  };
}

function toDailyLog(entry: BackendJournalEntry): DailyLog {
  const foodRecord = {
    breakfast: entry.meals.find((meal) => meal.mealType === 'desjejum')?.description || '',
    lunch: entry.meals.find((meal) => meal.mealType === 'almoco')?.description || '',
    dinner: entry.meals.find((meal) => meal.mealType === 'jantar')?.description || '',
    snacks: entry.meals.find((meal) => meal.mealType === 'lanches')?.description || '',
    waterGlasses: waterLabelToGlasses(entry.waterIntakeLabel),
  };

  return {
    date: entry.entryDate,
    spiritualPractices: { morning: '', afternoon: '', evening: '' },
    reflection: entry.reflections?.emanacoesAlmaText || entry.reflections?.sincronicidadesText || '',
    energyLevel: entry.energyLevel ?? 3,
    awarenessLevel: entry.presenceLevel ?? 3,
    synchronicities: entry.reflections?.sincronicidadesText || undefined,
    shadowObservations: undefined,
    foodRecord,
    completedActions: {
      purification: false,
      nourishment: false,
      movement: false,
      nature: false,
      presence: false,
      shadowWork: false,
      study: false,
      gratitude: false,
      journaling: false,
      journeyTask: false,
      dailyChallenge: false,
      alignmentConfirmed: false,
    },
  };
}

export async function syncUserWithBackend(userProfile: Partial<UserProfile>): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const email = userProfile.email || user.email;
  // RegistrationRequest.email is required by the FastAPI contract.
  if (!email) return;

  await request('/auth/sync-user', {
    method: 'POST',
    body: JSON.stringify({
      firebaseUid: user.uid,
      email,
      displayName: userProfile.name || user.displayName || 'Buscador',
      photoUrl: userProfile.photoURL || user.photoURL || null,
      phoneNumber: userProfile.phone || user.phoneNumber || null,
      provider: user.providerData[0]?.providerId || 'password',
      emailVerified: user.emailVerified,
    }),
  });
}

export async function getCurrentBackendUser() {
  return await request('/auth/me');
}

export async function syncConsentWithBackend(
  consentType: string,
  consentVersion: string,
): Promise<void> {
  await ensureBackendUser();
  await request('/auth/consents', {
    method: 'POST',
    body: JSON.stringify({
      consentType,
      consentVersion,
      accepted: true,
      acceptedAt: new Date().toISOString(),
    }),
  });
}

export async function listJournalEntries(date?: string): Promise<{ entries: Array<BackendJournalEntry>; journalEntryIds: Record<string, string> }> {
  await ensureBackendUser();
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  const data = await request<BackendJournalEntry[]>(`/journal/entries${query}`);

  const journalEntryIds: Record<string, string> = {};
  const entries = data.map((entry) => {
    journalEntryIds[entry.entryDate] = entry.id;
    return entry;
  });

  return { entries, journalEntryIds };
}

export async function upsertJournalEntry(log: DailyLog, entryId?: string): Promise<BackendJournalEntry> {
  await ensureBackendUser();
  const path = entryId ? `/journal/entries/${entryId}` : '/journal/entries';
  const method = entryId ? 'PUT' : 'POST';
  return await request<BackendJournalEntry>(path, {
    method,
    body: JSON.stringify(toJournalPayload(log)),
  });
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  await ensureBackendUser();
  await request(`/journal/entries/${entryId}`, { method: 'DELETE' });
}

export async function listProgress(): Promise<BackendProgress[]> {
  await ensureBackendUser();
  return request<BackendProgress[]>('/progress/modules');
}

export async function upsertProgress(
  moduleSlug: string,
  progressPercent: number,
  lastSeenAt = new Date().toISOString(),
): Promise<BackendProgress> {
  await ensureBackendUser();
  const normalizedPercent = Math.max(0, Math.min(100, progressPercent));
  const status = normalizedPercent >= 100
    ? 'done'
    : normalizedPercent > 0
      ? 'in_progress'
      : 'locked';

  return request<BackendProgress>(`/progress/modules/${encodeURIComponent(moduleSlug)}`, {
    method: 'PUT',
    body: JSON.stringify({ status, progressPercent: normalizedPercent, lastSeenAt }),
  });
}

export async function deleteProgress(moduleSlug: string): Promise<void> {
  await ensureBackendUser();
  await request(`/progress/modules/${encodeURIComponent(moduleSlug)}`, { method: 'DELETE' });
}

export async function listFastingSessions(): Promise<BackendFastingSession[]> {
  await ensureBackendUser();
  return request<BackendFastingSession[]>('/fasting/sessions');
}

export async function startFastingSession(
  selectedWindowHours: number,
  source = 'bussoladaalma',
): Promise<BackendFastingSession> {
  await ensureBackendUser();
  return request<BackendFastingSession>('/fasting/sessions', {
    method: 'POST',
    body: JSON.stringify({
      selectedWindowLabel: `${selectedWindowHours}h`,
      selectedWindowHours,
      startedAt: new Date().toISOString(),
      status: 'active',
      source,
    }),
  });
}

export async function finishFastingSession(
  session: BackendFastingSession,
): Promise<BackendFastingSession> {
  await ensureBackendUser();
  return request<BackendFastingSession>(`/fasting/sessions/${encodeURIComponent(session.id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      selectedWindowLabel: session.selectedWindowLabel,
      selectedWindowHours: session.selectedWindowHours,
      startedAt: session.startedAt,
      endedAt: new Date().toISOString(),
      status: 'completed',
      source: session.source,
    }),
  });
}

export function journalEntryToDailyLog(entry: BackendJournalEntry): DailyLog {
  return toDailyLog(entry);
}
