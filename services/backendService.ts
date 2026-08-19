import { auth } from '../firebase';
import { DailyLog, UserProfile } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface ApiErrorItem {
  code: string;
  message: string;
  field?: string;
}

interface ApiEnvelope<T> {
  data: T | null;
  meta: { requestId: string; schemaVersion: string };
  errors: ApiErrorItem[];
}

interface BackendJournalEntry {
  id: string;
  entryDate: string;
  energyLevel: number | null;
  presenceLevel: number | null;
  waterIntakeLabel: string | null;
  restWindowLabel: string | null;
  meals: Array<{ mealType: string; description?: string | null }>;
  reflections: {
    emanacoesAlmaText?: string | null;
    sincronicidadesText?: string | null;
  } | null;
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  let envelope: ApiEnvelope<T>;
  try {
    envelope = await response.json();
  } catch {
    throw new Error(`Request failed ${response.status} ${response.statusText}`);
  }

  if (!response.ok || envelope.errors?.length) {
    const message = envelope.errors?.map((e) => e.message).join('; ') || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return envelope.data as T;
}

function toJournalPayload(log: DailyLog) {
  const meals: Array<{ mealType: string; description?: string | null }> = [];
  if (log.foodRecord?.breakfast) meals.push({ mealType: 'desjejum', description: log.foodRecord.breakfast });
  if (log.foodRecord?.lunch) meals.push({ mealType: 'almoco', description: log.foodRecord.lunch });
  if (log.foodRecord?.dinner) meals.push({ mealType: 'jantar', description: log.foodRecord.dinner });
  if (log.foodRecord?.snacks) meals.push({ mealType: 'lanches', description: log.foodRecord.snacks });

  const reflections = {
    emanacoesAlmaText: log.reflection || null,
    sincronicidadesText: log.synchronicities || log.shadowObservations || null,
  };

  return {
    entryDate: log.date,
    energyLevel: log.energyLevel,
    presenceLevel: log.awarenessLevel,
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
    waterGlasses: 0,
  };

  return {
    date: entry.entryDate,
    spiritualPractices: { morning: '', afternoon: '', evening: '' },
    reflection: entry.reflections?.emanacoesAlmaText || '',
    energyLevel: entry.energyLevel ?? 3,
    awarenessLevel: entry.presenceLevel ?? 3,
    synchronicities: entry.reflections?.sincronicidadesText || undefined,
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

  await request('/auth/sync-user', {
    method: 'POST',
    body: JSON.stringify({
      firebaseUid: user.uid,
      email: userProfile.email || user.email || '',
      displayName: userProfile.name || user.displayName || 'Buscador',
      photoUrl: userProfile.photoURL || user.photoURL || null,
      phoneNumber: userProfile.phone || null,
      provider: 'password',
      emailVerified: user.emailVerified,
    }),
  });
}

export async function getCurrentBackendUser() {
  return await request('/auth/me');
}

export async function listJournalEntries(date?: string): Promise<{ entries: BackendJournalEntry[]; journalEntryIds: Record<string, string> }> {
  const qs = date ? `?date=${encodeURIComponent(date)}` : '';
  const entries = await request<BackendJournalEntry[]>(`/journal/entries${qs}`);

  const journalEntryIds: Record<string, string> = {};
  entries.forEach((entry) => {
    journalEntryIds[entry.entryDate] = entry.id;
  });

  return { entries, journalEntryIds };
}

export async function upsertJournalEntry(log: DailyLog): Promise<BackendJournalEntry> {
  return await request<BackendJournalEntry>('/journal/entries', {
    method: 'POST',
    body: JSON.stringify(toJournalPayload(log)),
  });
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  await request(`/journal/entries/${entryId}`, { method: 'DELETE' });
}

export function journalEntryToDailyLog(entry: BackendJournalEntry): DailyLog {
  return toDailyLog(entry);
}
