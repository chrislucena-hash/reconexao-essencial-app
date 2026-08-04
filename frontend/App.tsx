
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
import WelcomeCover from './components/WelcomeCover';
import InstructionPortal from './components/InstructionPortal';
import DisclaimerScreen from './components/DisclaimerScreen';
import Settings from './components/Settings';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';
import { AppView, UserProfile, DailyLog, JourneyProgress } from './types';
import { INITIAL_JOURNEY } from './constants';
import { Compass, Sparkles, X, Flame, Loader2 } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  listJournalEntries,
  upsertJournalEntry,
  syncUserWithBackend,
  syncConsentWithBackend,
  journalEntryToDailyLog,
  listProgress,
  upsertProgress,
  deleteProgress,
  deleteJournalEntry,
} from './services/backendService';

const AppContent: React.FC = () => {
  const { user, userProfile: fbProfile, loading: fbLoading } = useFirebase();
  const [currentView, setCurrentView] = useState<AppView>(AppView.WELCOME);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Buscador',
    startDate: null,
    awakeningScore: 0,
    hasSeenWarning: false,
    isOnPath: false,
  });
  const [logs, setLogs] = useState<DailyLog[]>(() => {
    try {
      const saved = localStorage.getItem('reconexao_daily_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [journeyProgress, setJourneyProgress] = useState<JourneyProgress>(() => {
    try {
      const saved = localStorage.getItem('soul_journey_progress');
      return saved ? JSON.parse(saved) : { currentDay: 1, days: INITIAL_JOURNEY, lastCompletedDate: null };
    } catch {
      return { currentDay: 1, days: INITIAL_JOURNEY, lastCompletedDate: null };
    }
  });
  const [showNavNudge, setShowNavNudge] = useState(false);

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

  // Sync logs from backend or Firebase
  useEffect(() => {
    let cancelled = false;

    const loadJournalEntries = async () => {
      if (!user) return;
      try {
        // The FastAPI journal is user-scoped, so bootstrap the user before reading it.
        await syncUserWithBackend({ ...userProfile, email: user.email || userProfile.email });
        const { entries } = await listJournalEntries();
        if (cancelled) return;
        const fetchedLogs = entries.map((entry) => {
          const backendLog = journalEntryToDailyLog(entry);
          const localLog = logs.find((log) => log.date === backendLog.date);

          return {
            ...backendLog,
            // These fields are still stored by the Firebase client contract.
            spiritualPractices: localLog?.spiritualPractices ?? backendLog.spiritualPractices,
            completedActions: localLog?.completedActions ?? backendLog.completedActions,
            shadowObservations: localLog?.shadowObservations,
          };
        });
        setLogs(fetchedLogs);
        try {
          localStorage.setItem('reconexao_daily_logs', JSON.stringify(fetchedLogs));
        } catch (e) {}
      } catch (err) {
        console.warn('Failed to load backend journal entries:', err);
      }
    };

    loadJournalEntries();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Also mirror the journey summary in FastAPI. Detailed day content remains
  // compatible with the existing Firebase/local representation.
  useEffect(() => {
    if (!user) return;

    const loadBackendJourneyProgress = async () => {
      try {
        await syncUserWithBackend({ ...userProfile, email: user.email || userProfile.email });
        const progressItems = await listProgress();
        const journeySummary = progressItems.find((item) => item.moduleSlug === 'journey-21-days');
        if (!journeySummary || localStorage.getItem('soul_journey_progress')) return;

        const completedDays = Math.round((journeySummary.progressPercent / 100) * INITIAL_JOURNEY.length);
        const days = INITIAL_JOURNEY.map((day) => ({ ...day, completed: day.day <= completedDays }));
        const hydratedProgress: JourneyProgress = {
          currentDay: days.find((day) => !day.completed)?.day || INITIAL_JOURNEY.length,
          days,
          lastCompletedDate: journeySummary.lastSeenAt?.slice(0, 10) || null,
        };
        setJourneyProgress(hydratedProgress);
        localStorage.setItem('soul_journey_progress', JSON.stringify(hydratedProgress));
      } catch (err) {
        console.warn('Backend journey progress sync failed:', err);
      }
    };

    loadBackendJourneyProgress();
  }, [user]);

  const handleUpdateJourneyProgress = async (newProgress: JourneyProgress) => {
    setJourneyProgress(newProgress);
    try {
      localStorage.setItem('soul_journey_progress', JSON.stringify(newProgress));
    } catch (e) {}

    if (user) {
      try {
        const completedDays = newProgress.days.filter((day) => day.completed).length;
        await upsertProgress('journey-21-days', Math.round((completedDays / INITIAL_JOURNEY.length) * 100));
      } catch (err) {
        console.warn('Backend journey progress update failed:', err);
      }
      try {
        await setDoc(doc(db, 'users', user.uid, 'journey', 'progress'), newProgress);
      } catch (err) {
        console.error("Error saving journey progress:", err);
      }
    }
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

    setUserProfile(prev => ({ ...prev, ...updates }));
    await handleUpdateProfile(updates);

    setTimeout(() => setCurrentView(AppView.EVOLUTION), 1000);
  };

  const handleSaveLog = async (log: DailyLog) => {
    setLogs(prevLogs => {
      const updated = prevLogs.some(l => l.date === log.date)
        ? prevLogs.map(l => l.date === log.date ? log : l)
        : [log, ...prevLogs];
      try {
        localStorage.setItem('reconexao_daily_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (user) {
      try {
        await upsertJournalEntry(log);
      } catch (err) {
        console.error('Error saving log to backend:', err);
      }
    }
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

    setLogs(prevLogs => {
      const updated = prevLogs.some(l => l.date === today)
        ? prevLogs.map(l => l.date === today ? newLog : l)
        : [newLog, ...prevLogs];
      try {
        localStorage.setItem('reconexao_daily_logs', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (user) {
      try {
        await upsertJournalEntry(newLog);
      } catch (err) {
        console.warn('Backend daily goal sync failed:', err);
      }
      try {
        await setDoc(doc(db, 'users', user.uid, 'logs', today), newLog);
      } catch (err) {
        console.error("Error toggling goal:", err);
      }
    }
  };

  const handleAcceptDisclaimer = async (email: string) => {
    const updates: Partial<UserProfile> = { hasAcceptedTerms: true };
    if (email) {
      updates.email = email;
    }
    await handleUpdateProfile(updates);

    if (user) {
      try {
        await syncConsentWithBackend('medical_disclaimer', '1.0.0');
      } catch (err) {
        console.warn('Backend consent sync failed:', err);
      }
    }
    
    if (userProfile && userProfile.isOnPath) {
      setCurrentView(AppView.DASHBOARD);
    } else {
      setCurrentView(AppView.INSTRUCTIONS);
    }
  };

  const handleFirestoreError = (error: any, operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write', path: string) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous
      }
    };
    console.error('Firestore operation warning: ', JSON.stringify(errInfo));
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    if (user) {
      try {
        await syncUserWithBackend({ ...userProfile, ...updates });
      } catch (err) {
        console.warn('Backend user sync failed:', err);
      }
      try {
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, 'update', `users/${user.uid}`);
      }
    }
  };

  const handleResetJourney = async () => {
    const resetProfile: UserProfile = {
      name: 'Buscador',
      startDate: null,
      awakeningScore: 0,
      hasSeenWarning: false,
      hasAcceptedTerms: false,
      isOnPath: false,
      favoriteActivities: [],
      diagnosisHistory: [],
      role: 'client'
    };

    if (userProfile.email) {
      resetProfile.email = userProfile.email;
    }
    if (userProfile.phone) {
      resetProfile.phone = userProfile.phone;
    }

    setUserProfile(resetProfile);
    setLogs([]);
    setJourneyProgress({ currentDay: 1, days: INITIAL_JOURNEY, lastCompletedDate: null });

    // Clear local storage
    try {
      localStorage.removeItem('reconexao_daily_logs');
      localStorage.removeItem('soul_journey_progress');
      localStorage.removeItem('userProfile_spiritual');
      localStorage.removeItem('userLogs_spiritual');
    } catch (e) {}

    if (user) {
      try {
        const { entries } = await listJournalEntries();
        await Promise.all(entries.map((entry) => deleteJournalEntry(entry.id)));
        await deleteProgress('journey-21-days');
      } catch (err) {
        console.warn('Backend journey reset failed:', err);
      }

      try {
        const userPath = `users/${user.uid}`;
        // Overwrite the user profile document on firestore (no merge to fully reset)
        try {
          await setDoc(doc(db, 'users', user.uid), resetProfile);
        } catch (err) {
          handleFirestoreError(err, 'write', userPath);
        }

        // Fetch and delete all logs collection documents
        const { deleteDoc, doc: firestoreDoc, collection: firestoreCollection, getDocs } = await import('firebase/firestore');
        const logsPath = `users/${user.uid}/logs`;
        try {
          const logsRef = firestoreCollection(db, 'users', user.uid, 'logs');
          const logsSnap = await getDocs(logsRef);
          for (const docSnap of logsSnap.docs) {
            const logDocPath = `users/${user.uid}/logs/${docSnap.id}`;
            try {
              await deleteDoc(firestoreDoc(db, 'users', user.uid, 'logs', docSnap.id));
            } catch (err) {
              handleFirestoreError(err, 'delete', logDocPath);
            }
          }
        } catch (err) {
          handleFirestoreError(err, 'list', logsPath);
        }

        // Delete journey progress document from Firestore
        const journeyDocPath = `users/${user.uid}/journey/progress`;
        try {
          await deleteDoc(firestoreDoc(db, 'users', user.uid, 'journey', 'progress'));
        } catch (err) {
          handleFirestoreError(err, 'delete', journeyDocPath);
        }
      } catch (err) {
        console.error("Error resetting journey on firestore:", err);
      }
    }

    setCurrentView(AppView.WELCOME);
    window.location.reload();
  };

  if (fbLoading) {
    return (
      <div className="min-h-screen bg-ethereal-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="text-magic-gold animate-spin mx-auto" />
          <p className="text-magic-gold font-serif italic tracking-widest">Sincronizando com a Centelha...</p>
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
        return <Tracker onSaveLog={handleSaveLog} logs={logs} />;
      case AppView.WELLNESS:
        return <Wellness />;
      case AppView.GUIDANCE:
        return <Guidance />;
      case AppView.COMMUNITY:
        return <Community />;
      case AppView.JOURNEY:
        return <Journey progress={journeyProgress} onUpdateProgress={handleUpdateJourneyProgress} onResetJourney={handleResetJourney} />;
      case AppView.EVOLUTION:
        return <EvolutionReport logs={logs} userProfile={userProfile} />;
      case AppView.SETTINGS:
        return <Settings userProfile={userProfile} onUpdateProfile={handleUpdateProfile} setView={setCurrentView} onResetJourney={handleResetJourney} />;
      default:
        return <Dashboard userProfile={userProfile} logs={logs} onToggleGoal={toggleDailyGoal} setView={setCurrentView} journeyProgress={journeyProgress} />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-ethereal-950 text-gray-100 font-sans selection:bg-magic-gold/30 overflow-x-hidden flex flex-col w-full">
      <main className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-transparent min-h-[100dvh] shadow-2xl relative overflow-x-hidden px-3 sm:px-6 pt-safe pb-safe-nav flex-1">
        
        <div className="relative z-10 w-full">{renderView()}</div>
        
        {/* Nudge Toast for Navigation */}
        {showNavNudge && currentView !== AppView.INSTRUCTIONS && (
          <div className="fixed bottom-[max(6.5rem,calc(5.5rem+env(safe-area-inset-bottom)))] left-1/2 -translate-x-1/2 z-50 w-[88%] max-w-sm animate-in slide-up">
            <div className="glass-mystic p-4 rounded-2xl border border-magic-gold/20 flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-ethereal-950/90 backdrop-blur-xl">
               <div className="shrink-0 p-2 bg-magic-gold/10 rounded-lg text-magic-gold">
                  <Compass size={18} className="animate-spin-slow" />
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-magic-gold">Voz da Centelha</p>
                  <p className="text-[11px] text-ethereal-100 italic leading-relaxed">Honre seu tempo peregrinando por todos os portais da senda.</p>
               </div>
               <button onClick={() => setShowNavNudge(false)} className="text-ethereal-500 hover:text-white transition-colors p-1">
                  <X size={14} />
               </button>
            </div>
          </div>
        )}

        <div className="fixed top-[-10%] left-[-10%] w-full h-full bg-aura-violet/10 blur-[150px] pointer-events-none rounded-full animate-pulse-soft overflow-hidden" />
        <div className="fixed bottom-[-10%] right-[-10%] w-full h-full bg-aura-teal/10 blur-[150px] pointer-events-none rounded-full animate-pulse-soft overflow-hidden" style={{ animationDelay: '-2s' }} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-aura-rose/5 blur-[200px] pointer-events-none rounded-full animate-pulse-soft overflow-hidden" style={{ animationDelay: '-4s' }} />
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
