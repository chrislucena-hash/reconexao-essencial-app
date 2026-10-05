type FakeReference = { path: string };

const scenario = () =>
  (window as typeof window & { __E2E_FIREBASE_SCENARIO__?: string }).__E2E_FIREBASE_SCENARIO__;

export const getFirestore = () => ({});
export const doc = (_db: unknown, ...segments: string[]): FakeReference => ({ path: segments.join('/') });
export const collection = doc;
export const query = (reference: FakeReference) => reference;
export const orderBy = () => ({});
export const limit = () => ({});
export const increment = (value: number) => value;

export const onSnapshot = (reference: FakeReference, next: (snapshot: unknown) => void) => {
  const isProfile = reference.path === 'users/e2e-user';
  if (isProfile && scenario() === 'profile-stalled') return () => {};

  let active = true;
  queueMicrotask(() => {
    if (!active) return;
    next({
      exists: () => isProfile,
      data: () => isProfile
        ? {
            name: 'Teste de publicação',
            email: 'teste@example.invalid',
            startDate: '2026-10-05',
            awakeningScore: 0,
            hasSeenWarning: true,
            hasAcceptedTerms: true,
            isOnPath: true,
            favoriteActivities: [],
            diagnosisHistory: [],
          }
        : undefined,
      docs: [],
    });
  });
  return () => { active = false; };
};

export const setDoc = async () => {};
export const addDoc = async () => ({ id: 'e2e-document' });
export const updateDoc = async () => {};
export const deleteDoc = async () => {};
export const getDocs = async () => ({ size: 0, docs: [] });
export const writeBatch = () => ({ set: () => {}, delete: () => {}, commit: async () => {} });
