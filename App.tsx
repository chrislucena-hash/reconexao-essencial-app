
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Diagnosis from './components/Diagnosis';
import Dashboard from './components/Dashboard';
import Tracker from './components/Tracker';
import Wellness from './components/Wellness';
import Guidance from './components/Guidance';
import Community from './components/Community';
import Journey from './components/Journey';
import EvolutionReport from './components/EvolutionReport';
import WelcomeCover, { BrandHeartLogo } from './components/WelcomeCover';
import InstructionPortal from './components/InstructionPortal';
import DisclaimerScreen from './components/DisclaimerScreen';
import Settings from './components/Settings';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';
import { AppView, UserProfile, DailyLog, JourneyProgress } from './types';
import { INITIAL_JOURNEY } from './constants';
import { unlockMobileAudio } from './services/audioService';
import { Compass, Sparkles, X, Flame, Loader2 } from 'lucide-react';
import { doc, setDoc, collection, onSnapshot, query, orderBy, limit, getDocs, writeBatch } from 'firebase/firestore';
import { db, auth } from './firebase';
import { syncUserWithBackend, upsertJournalEntry } from './services/backendService';

const AppContent: React.FC = () => {
  const { user, userProfile: fbProfile, loading: fbLoading, error: profileSyncError } = useFirebase();
  const [currentView, setCurrentView] = useState<AppView>(AppView.WELCOME);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Buscador',
    startDate: null,
    awakeningScore: 0,
    hasSeenWarning: false,
    isOnPath: false,
  });
  // Wait for the signed-in account's Firestore snapshot. Shared local keys could
  // otherwise show a previous account's diary or progress before sync finishes.
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [journeyProgress, setJourneyProgress] = useState<JourneyProgress>({
    currentDay: 1, days: INITIAL_JOURNEY, lastCompletedDate: null
  });
  const [showNavNudge, setShowNavNudge] = useState(false);
  const [logsSyncError, setLogsSyncError] = useState(false);
  const [journeySyncError, setJourneySyncError] = useState(false);

  useEffect(() => {
    setUserProfile({
      name: 'Buscador',
      startDate: null,
      awakeningScore: 0,
      hasSeenWarning: false,
      isOnPath: false,
    });
  }, [user?.uid]);

  // Global mobile audio unlock on first user gesture (iOS Safari & Android Chrome)
  useEffect(() => {
    const handleGesture = () => {
      unlockMobileAudio();
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
    };

    window.addEventListener('touchstart', handleGesture, { passive: true });
    window.addEventListener('click', handleGesture, { passive: true });
    window.addEventListener('pointerdown', handleGesture, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
    };
  }, []);

  // Sync local profile with Firebase profile and handle initial routing
  useEffect(() => {
    if (fbProfile) {
      setUserProfile(fbProfile);
      
      if (currentView === AppView.WELCOME || currentView === AppView.DISCLAIMER) {
        if (fbProfile.isOnPath) {
          setCurrentView(AppView.DASHBOARD);
        }
        // Let the user stay on WELCOME or DISCLAIMER if they are not on the path, so they can manually go through the start/acceptance flow!
      }
    }
  }, [fbProfile]);

  // Enforce login gate - do not allow browsing inside the app if logged out
  useEffect(() => {
    if (!fbLoading && !user) {
      if (currentView !== AppView.WELCOME && currentView !== AppView.DISCLAIMER) {
        setCurrentView(AppView.WELCOME);
      }
    }
  }, [user, fbLoading, currentView]);

  // Sync logs from Firebase
  useEffect(() => {
    if (user) {
      setLogs([]);
      const logsRef = collection(db, 'users', user.uid, 'logs');
      const q = query(logsRef, orderBy('date', 'desc'), limit(30));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setLogsSyncError(false);
        const fetchedLogs = snapshot.docs.map(doc => doc.data() as DailyLog);
        setLogs(fetchedLogs);
        try {
          localStorage.setItem('reconexao_daily_logs', JSON.stringify(fetchedLogs));
        } catch (e) {}
      }, (error) => {
        console.error('Diary sync failed:', error);
        setLogsSyncError(true);
      });
      return () => unsubscribe();
    }
    setLogs([]);
    setLogsSyncError(false);
    try { localStorage.removeItem('reconexao_daily_logs'); } catch (e) {}
  }, [user]);

  // Sync journey progress from Firebase
  useEffect(() => {
    if (user) {
      setJourneyProgress({ currentDay: 1, days: INITIAL_JOURNEY, lastCompletedDate: null });
      const progressRef = doc(db, 'users', user.uid, 'journey', 'progress');
      const unsubscribe = onSnapshot(progressRef, (docSnap) => {
        setJourneySyncError(false);
        if (docSnap.exists()) {
          const fetchedProgress = docSnap.data() as JourneyProgress;
          setJourneyProgress(fetchedProgress);
          try {
            localStorage.setItem('soul_journey_progress', JSON.stringify(fetchedProgress));
          } catch (e) {}
        } else {
          // Document was deleted or does not exist - reset to default!
          const defaultProgress = { currentDay: 1, days: INITIAL_JOURNEY, lastCompletedDate: null };
          setJourneyProgress(defaultProgress);
          try {
            localStorage.removeItem('soul_journey_progress');
          } catch (e) {}
        }
      }, (error) => {
        console.error('Journey sync failed:', error);
        setJourneySyncError(true);
      });
      return () => unsubscribe();
    }
    setJourneyProgress({ currentDay: 1, days: INITIAL_JOURNEY, lastCompletedDate: null });
    setJourneySyncError(false);
    try { localStorage.removeItem('soul_journey_progress'); } catch (e) {}
  }, [user]);

  const handleUpdateJourneyProgress = async (newProgress: JourneyProgress) => {
    if (!user) throw new Error('Entre na sua conta para salvar a jornada.');
    await setDoc(doc(db, 'users', user.uid, 'journey', 'progress'), newProgress);
    setJourneyProgress(newProgress);
    try {
      localStorage.setItem('soul_journey_progress', JSON.stringify(newProgress));
    } catch (e) {}
  };

  // Trigger nudge on view change
  useEffect(() => {
    if (userProfile.isOnPath && currentView !== AppView.WELCOME && currentView !== AppView.DIAGNOSIS && currentView !== AppView.INSTRUCTIONS) {
      setShowNavNudge(true);
      const timer = setTimeout(() => {
        setShowNavNudge(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentView, userProfile.isOnPath]);

  const handleDiagnosisComplete = async (
    score: number,
    name: string,
    favoriteActivities: string[],
    details?: {
      glutenCount: number;
      caseinCount: number;
      lactoseCount: number;
      spiritualCount: number;
    }
  ) => {
    const testTimestamp = new Date().toISOString();
    const newResult = {
      date: testTimestamp,
      score: score,
      glutenCount: details?.glutenCount ?? 0,
      caseinCount: details?.caseinCount ?? 0,
      lactoseCount: details?.lactoseCount ?? 0,
      spiritualCount: details?.spiritualCount ?? 0,
      favoriteActivities: favoriteActivities
    };

    const existingHistory = userProfile.diagnosisHistory || [];
    const updatedHistory = [
      newResult,
      ...existingHistory.filter(h => h.date !== testTimestamp)
    ];

    const updates = {
      name: name,
      awakeningScore: score,
      hasSeenWarning: true,
      startDate: userProfile.startDate || new Date().toISOString(),
      isOnPath: true,
      favoriteActivities: favoriteActivities,
      diagnosisHistory: updatedHistory
    };

    if (!user) throw new Error('Entre na sua conta para salvar o questionário.');
    await setDoc(doc(db, 'users', user.uid), { ...userProfile, ...updates }, { merge: true });
    setUserProfile(prev => ({ ...prev, ...updates }));
    syncUserWithBackend({ ...userProfile, ...updates }).catch(err => console.warn('Backend user sync failed:', err));
    setCurrentView(AppView.JOURNEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveLog = async (log: DailyLog) => {
    if (!user) throw new Error('Entre na sua conta para salvar o diário.');
    await setDoc(doc(db, 'users', user.uid, 'logs', log.date), log);
    setLogs(prevLogs => {
      const updated = prevLogs.some(l => l.date === log.date)
        ? prevLogs.map(l => l.date === log.date ? log : l)
        : [log, ...prevLogs];
      try {
        localStorage.setItem('reconexao_daily_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    upsertJournalEntry(log).catch(err => console.warn('Backend journal sync failed:', err));
  };

  const toggleDailyGoal = async (goalKey: keyof DailyLog['completedActions']) => {
    const today = new Date().toISOString().split('T')[0];
    const existingLog = logs.find(l => l.date === today);
    
    let newLog: DailyLog;
    if (existingLog) {
      newLog = {
        ...existingLog,
        completedActions: {
          ...existingLog.completedActions,
          [goalKey]: !existingLog.completedActions[goalKey]
        }
      };
    } else {
      newLog = {
        date: today,
        spiritualPractices: { morning: '', afternoon: '', evening: '' },
        reflection: '',
        energyLevel: 3,
        awarenessLevel: 3,
        ratingsRecorded: false,
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
          [goalKey]: true
        }
      };
    }

    if (!user) throw new Error('Entre na sua conta para salvar seus ritos.');
    await setDoc(doc(db, 'users', user.uid, 'logs', today), newLog);
    setLogs(prevLogs => {
      const updated = prevLogs.some(l => l.date === today)
        ? prevLogs.map(l => l.date === today ? newLog : l)
        : [newLog, ...prevLogs];
      try {
        localStorage.setItem('reconexao_daily_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

  };

  const handleAcceptDisclaimer = async (email: string) => {
    const updates: Partial<UserProfile> = { hasAcceptedTerms: true };
    if (email) {
      updates.email = email;
    }
    await handleUpdateProfile(updates);
    
    if (userProfile && userProfile.isOnPath) {
      setCurrentView(AppView.DASHBOARD);
    } else {
      setCurrentView(AppView.INSTRUCTIONS);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const activeUser = user || auth.currentUser;
    if (!activeUser) throw new Error('Entre na sua conta para salvar o perfil.');
    await setDoc(doc(db, 'users', activeUser.uid), updates, { merge: true });
    setUserProfile(prev => ({ ...prev, ...updates }));
    syncUserWithBackend({ ...userProfile, ...updates }).catch(err => console.warn('Backend user sync failed:', err));
  };

  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const notice = sessionStorage.getItem('cycle_reset_notice');
      if (notice === 'true') {
        sessionStorage.removeItem('cycle_reset_notice');
        setResetNotice("A jornada e os registros exibidos no diário foram reiniciados. Sua conta, publicações e possíveis cópias já sincronizadas com outros serviços não foram excluídas. Para solicitar a exclusão da conta e dos dados, use a opção em Configurações.");
      }
    } catch (e) {}
  }, []);

  const handleResetJourney = async () => {
    setResetError(null);
    if (!user) {
      setResetError('Entre na sua conta para reiniciar a jornada.');
      return;
    }

    const resetProfile: UserProfile = {
      name: 'Buscador',
      startDate: null,
      awakeningScore: 0,
      hasSeenWarning: false,
      hasAcceptedTerms: false,
      isOnPath: false,
      favoriteActivities: [],
      diagnosisHistory: [],
      role: userProfile.role || 'client',
      ...(userProfile.email ? { email: userProfile.email } : {}),
      ...(userProfile.phone ? { phone: userProfile.phone } : {})
    };

    try {
      const logsSnap = await getDocs(collection(db, 'users', user.uid, 'logs'));
      if (logsSnap.size > 450) {
        throw new Error('Too many diary records for a single reset batch');
      }
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', user.uid), resetProfile);
      batch.delete(doc(db, 'users', user.uid, 'journey', 'progress'));
      logsSnap.docs.forEach(logDoc => batch.delete(logDoc.ref));
      await batch.commit();

      setUserProfile(resetProfile);
      setLogs([]);
      setJourneyProgress({ currentDay: 1, days: INITIAL_JOURNEY, lastCompletedDate: null });
      try {
        localStorage.removeItem('reconexao_daily_logs');
        localStorage.removeItem('soul_journey_progress');
        localStorage.removeItem('userProfile_spiritual');
        localStorage.removeItem('userLogs_spiritual');
        sessionStorage.setItem('cycle_reset_notice', 'true');
      } catch (error) {
        console.warn('Could not clear local journey cache:', error);
      }
      setCurrentView(AppView.WELCOME);
      window.location.reload();
    } catch (error) {
      console.error('Error resetting journey:', error);
      setResetError('Não foi possível reiniciar toda a jornada. Verifique sua conexão e tente novamente.');
    }
  };

  if (fbLoading) {
    return (
      <div className="min-h-screen bg-[#F7F2EC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="text-[#A268D7] animate-spin mx-auto" />
          <p className="text-[#18245C] font-serif italic tracking-widest">Sincronizando com a Centelha...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.WELCOME:
        return <WelcomeCover onStart={() => setCurrentView(AppView.DISCLAIMER)} />;
      case AppView.DISCLAIMER:
        return <DisclaimerScreen onAccept={handleAcceptDisclaimer} isLoggedIn={!!user} />;
      case AppView.INSTRUCTIONS:
        return <InstructionPortal onProceed={() => setCurrentView(userProfile.isOnPath ? AppView.DASHBOARD : AppView.DIAGNOSIS)} />;
      case AppView.DIAGNOSIS:
        return <Diagnosis onComplete={handleDiagnosisComplete} userProfile={userProfile} onBack={() => setCurrentView(AppView.DASHBOARD)} />;
      case AppView.DASHBOARD:
        return <Dashboard userProfile={userProfile} logs={logs} onToggleGoal={toggleDailyGoal} setView={setCurrentView} journeyProgress={journeyProgress} />;
      case AppView.TRACKER:
        return <Tracker onSaveLog={handleSaveLog} logs={logs} setView={setCurrentView} />;
      case AppView.WELLNESS:
        return <Wellness setView={setCurrentView} />;
      case AppView.GUIDANCE:
        return <Guidance setView={setCurrentView} />;
      case AppView.COMMUNITY:
        return <Community setView={setCurrentView} onResetJourney={handleResetJourney} />;
      case AppView.JOURNEY:
        return <Journey progress={journeyProgress} onUpdateProgress={handleUpdateJourneyProgress} onResetJourney={handleResetJourney} setView={setCurrentView} />;
      case AppView.EVOLUTION:
        return <EvolutionReport logs={logs} userProfile={userProfile} setView={setCurrentView} />;
      case AppView.SETTINGS:
        return <Settings userProfile={userProfile} onUpdateProfile={handleUpdateProfile} setView={setCurrentView} onResetJourney={handleResetJourney} />;
      default:
        return <Dashboard userProfile={userProfile} logs={logs} onToggleGoal={toggleDailyGoal} setView={setCurrentView} journeyProgress={journeyProgress} />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F7F2EC] text-[#18245C] font-sans overflow-x-hidden flex flex-col w-full">
      <main className={`mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-transparent min-h-[100dvh] relative overflow-x-hidden ${currentView === AppView.WELCOME ? 'px-0 pt-0 pb-0' : 'px-3 sm:px-6 pt-safe pb-safe-nav'} flex-1 flex flex-col`}>
        
        {currentView !== AppView.WELCOME && (
          <header className="w-full flex items-center justify-between py-2 px-1 mb-2 border-b border-[#18245C]/10 bg-[#F7F2EC]/90 backdrop-blur-sm sticky top-0 z-40 transition-all">
            <button 
              onClick={() => setCurrentView(AppView.WELCOME)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left"
              title="Voltar para Capa Inicial"
            >
              <BrandHeartLogo size={28} />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] sm:text-xs font-extrabold tracking-wider text-[#18245C]">
                  RECONEXÃO <span className="text-[#9333EA] font-normal">ESSENCIAL</span>
                </span>
                <span className="text-[7px] font-bold text-[#E9B44C] tracking-[0.2em]">CHRIS LUCËNA</span>
              </div>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-black uppercase text-[#E9B44C] tracking-widest bg-[#E9B44C]/10 px-2 py-0.5 rounded-full border border-[#E9B44C]/20">
                Centelha Divina
              </span>
            </div>
          </header>
        )}

        {(profileSyncError || logsSyncError || journeySyncError) && user && (
          <p role="alert" className="relative z-10 mx-2 mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            Não foi possível carregar todos os seus dados. Verifique a conexão e reabra o app antes de continuar.
          </p>
        )}
        <div className="relative z-10 w-full flex-1 flex flex-col">{renderView()}</div>
        
        {/* Reset Notice Modal */}
        {(resetNotice || resetError) && (
          <div className="fixed inset-0 z-[100] bg-[#18245C]/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white border border-[#18245C]/10 w-full max-w-sm rounded-2xl p-8 flex flex-col items-center text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 bg-[#A268D7]/10 rounded-full flex items-center justify-center text-[#A268D7] border border-[#A268D7]/20">
                <Sparkles size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-[#18245C] font-semibold">{resetError ? 'Não foi possível reiniciar' : 'Novo Ciclo Iniciado'}</h3>
                <p className="text-sm text-[#4A506B] leading-relaxed">
                  {resetError || resetNotice}
                </p>
              </div>
              <button 
                onClick={() => { setResetNotice(null); setResetError(null); }}
                className="w-full brand-gradient-btn py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:opacity-95 transition-opacity"
              >
                Compreendi
              </button>
            </div>
          </div>
        )}

        {/* Nudge Toast for Navigation */}
        {showNavNudge && currentView !== AppView.INSTRUCTIONS && (
          <div className="fixed bottom-[max(6.5rem,calc(5.5rem+env(safe-area-inset-bottom)))] left-1/2 -translate-x-1/2 z-50 w-[88%] max-w-sm animate-in slide-up">
            <div className="bg-white p-4 rounded-2xl border border-[#18245C]/10 flex items-center gap-4 shadow-lg">
               <div className="shrink-0 p-2 bg-[#A268D7]/10 rounded-xl text-[#A268D7]">
                  <Compass size={18} className="animate-spin-slow" />
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#A268D7]">Voz da Centelha</p>
                  <p className="text-xs text-[#18245C] italic leading-relaxed">Honre seu tempo peregrinando por todos os portais da senda.</p>
               </div>
               <button onClick={() => setShowNavNudge(false)} className="text-[#8A7B69] hover:text-[#18245C] transition-colors p-1">
                  <X size={14} />
               </button>
            </div>
          </div>
        )}

        <div className="fixed top-[-10%] left-[-10%] w-full h-full bg-[#5B8DE6]/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="fixed bottom-[-10%] right-[-10%] w-full h-full bg-[#A268D7]/5 blur-[120px] pointer-events-none rounded-full" />
      </main>
      
      {userProfile.isOnPath && currentView !== AppView.WELCOME && currentView !== AppView.INSTRUCTIONS && (
        <Navigation currentView={currentView} setView={setCurrentView} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
};

export default App;
