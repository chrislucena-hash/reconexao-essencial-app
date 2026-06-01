import { auth } from '../firebase';
import { DailyLog, UserProfile } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? '';
const developmentToken = import.meta.env.VITE_API_DEV_TOKEN?.trim() ?? '';

export const isBackendConfigured = apiBaseUrl.length > 0;

interface ApiEnvelope<T> {
  data: T | null;
  errors: Array<{ message: string }>;
}

interface BackendUser {
  firebaseUid: string;
  email: string;
  displayName?: string | null;
  phoneNumber?: string | null;
}

interface BackendFastingSession {
  id: string;
  selectedWindowHours: number;
  startedAt: string;
  status: string;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Usuario nao autenticado.');
  }

  const token = developmentToken || await currentUser.getIdToken();
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  const body = await response.json().catch(() => null) as ApiEnvelope<T> | null;

  if (!response.ok || !body?.data) {
    throw new Error(body?.errors?.[0]?.message ?? 'Falha ao comunicar com o backend.');
  }

  return body.data;
}

export async function syncBackendUser(profile: Partial<UserProfile>, emailFallback?: string): Promise<BackendUser> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Usuario nao autenticado.');
  }

  const email = profile.email || currentUser.email || emailFallback;
  if (!email) {
    throw new Error('E-mail necessario para sincronizar o usuario.');
  }

  const firebaseUid = developmentToken ? 'dev-user' : currentUser.uid;
  return request<BackendUser>('/auth/sync-user', {
    method: 'POST',
    body: JSON.stringify({
      firebaseUid,
      email,
      displayName: profile.name || currentUser.displayName || 'Buscador',
      phoneNumber: profile.phone || currentUser.phoneNumber || null,
      photoUrl: currentUser.photoURL,
      provider: 'password',
      emailVerified: currentUser.emailVerified,
    }),
  });
}

export function saveBackendConsent(): Promise<unknown> {
  return request('/auth/consents', {
    method: 'POST',
    body: JSON.stringify({
      consentType: 'medical_disclaimer',
      consentVersion: '1.0.0',
      accepted: true,
      acceptedAt: new Date().toISOString(),
    }),
  });
}

function waterIntakeLabel(glasses?: number): string | null {
  if (!glasses) return null;
  if (glasses > 5) return 'Mais de 5 copos';
  return `${glasses} ${glasses === 1 ? 'copo' : 'copos'}`;
}

export async function saveBackendJournalEntry(log: DailyLog, profile: Partial<UserProfile>): Promise<unknown> {
  // The API stores the journal subset supported by its current public schema.
  await syncBackendUser(profile);
  return request('/journal/entries', {
    method: 'POST',
    body: JSON.stringify({
      entryDate: log.date,
      energyLevel: log.energyLevel,
      presenceLevel: log.awarenessLevel,
      waterIntakeLabel: waterIntakeLabel(log.foodRecord?.waterGlasses),
      meals: [
        { mealType: 'desjejum', description: log.foodRecord?.breakfast || null },
        { mealType: 'almoco', description: log.foodRecord?.lunch || null },
        { mealType: 'jantar', description: log.foodRecord?.dinner || null },
        { mealType: 'lanches', description: log.foodRecord?.snacks || null },
      ],
      reflections: {
        emanacoesAlmaText: log.reflection || null,
        sincronicidadesText: log.synchronicities || null,
      },
    }),
  });
}

export async function saveBackendProgress(
  moduleSlug: string,
  progressPercent: number,
  profile: Partial<UserProfile>,
): Promise<unknown> {
  await syncBackendUser(profile);
  return request(`/progress/modules/${encodeURIComponent(moduleSlug)}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: progressPercent >= 100 ? 'done' : 'in_progress',
      progressPercent,
      lastSeenAt: new Date().toISOString(),
    }),
  });
}

export async function startBackendFastingSession(
  hours: number,
  profile: Partial<UserProfile>,
): Promise<BackendFastingSession> {
  await syncBackendUser(profile);
  return request<BackendFastingSession>('/fasting/sessions', {
    method: 'POST',
    body: JSON.stringify({
      selectedWindowLabel: `${hours}h`,
      selectedWindowHours: hours,
      startedAt: new Date().toISOString(),
      status: 'active',
      source: 'bussoladaalma',
    }),
  });
}

export function endBackendFastingSession(
  session: BackendFastingSession,
): Promise<BackendFastingSession> {
  return request<BackendFastingSession>(`/fasting/sessions/${encodeURIComponent(session.id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      selectedWindowLabel: `${session.selectedWindowHours}h`,
      selectedWindowHours: session.selectedWindowHours,
      startedAt: session.startedAt,
      endedAt: new Date().toISOString(),
      status: 'completed',
      source: 'bussoladaalma',
    }),
  });
}
