type Scenario = 'signed-out' | 'auth-stalled' | 'profile-stalled' | 'profile-ready';
type FakeUser = { uid: string; email: string; getIdToken: () => Promise<string> };
type AuthListener = (user: FakeUser | null) => void;

const listeners = new Set<AuthListener>();
const auth = { currentUser: null as FakeUser | null };

const scenario = (): Scenario =>
  (window as typeof window & { __E2E_FIREBASE_SCENARIO__?: Scenario }).__E2E_FIREBASE_SCENARIO__ ?? 'signed-out';

export const getAuth = () => auth;

export const onAuthStateChanged = (_auth: unknown, listener: AuthListener) => {
  listeners.add(listener);
  if (scenario() !== 'auth-stalled') {
    queueMicrotask(() => {
      if (!listeners.has(listener)) return;
      auth.currentUser = scenario() === 'signed-out'
        ? null
        : { uid: 'e2e-user', email: 'teste@example.invalid', getIdToken: async () => 'e2e-token' };
      listener(auth.currentUser);
    });
  }
  return () => listeners.delete(listener);
};

export const signOut = async () => {
  auth.currentUser = null;
  for (const listener of listeners) listener(null);
};

export const signInWithEmailAndPassword = async () => {
  throw Object.assign(new Error('Credenciais de teste não configuradas.'), { code: 'auth/invalid-credential' });
};
