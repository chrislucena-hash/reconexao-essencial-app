
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
import { AppView, UserProfile, DailyLog } from './types';
import { Compass, Sparkles, X, Flame, Loader2 } from 'lucide-react';
import { doc, setDoc, getDoc, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from './firebase';
import { isBackendConfigured, saveBackendConsent, saveBackendJournalEntry, syncBackendUser } from './services/apiClient';

const screenshotPreview = import.meta.env.DEV
  && new URLSearchParams(window.location.search).get('preview') === 'screenshots';

const screenshotView = (() => {
  const requestedView = new URLSearchParams(window.location.search).get('screen') as AppView | null;
  return requestedView && Object.values(AppView).includes(requestedView) ? requestedView : AppView.WELCOME;
})();

const screenshotProfile: UserProfile = {
  name: 'Luna',
  email: 'luna@reconexao.app',
  startDate: '2026-05-12T10:00:00.000Z',
  awakeningScore: 84,
  hasSeenWarning: true,
  hasAcceptedTerms: true,
  isOnPath: true,
  favoriteActivities: ['yoga', 'walk'],
  role: 'client',
};

const createScreenshotLogs = (): DailyLog[] => {
  const today = new Date();

  return [0, 1, 2, 3, 4, 5, 6].map((daysAgo) => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);

    return {
      date: date.toISOString().split('T')[0],
      spiritualPractices: {
        morning: 'Respiracao consciente e intencao',
        afternoon: 'Pausa de presenca',
        evening: 'Gratidao e silencio',
      },
      reflection: 'Senti mais clareza e serenidade ao honrar meu ritmo hoje.',
      synchronicities: 'Encontrei a mensagem certa no momento certo.',
      shadowObservations: 'Observei a autocobranca com acolhimento.',
      energyLevel: daysAgo >= 5 ? 3 : daysAgo >= 2 ? 4 : 5,
      awarenessLevel: daysAgo >= 5 ? 3 : daysAgo >= 3 ? 4 : 5,
      foodRecord: {
        breakfast: 'Frutas e cha',
        lunch: 'Vegetais e graos',
        dinner: 'Sopa leve',
        snacks: 'Castanhas',
        waterGlasses: 8,
        fastingHours: 12,
      },
      completedActions: {
        purification: true,
        nourishment: true,
        movement: daysAgo !== 2,
        nature: true,
        presence: true,
        shadowWork: daysAgo < 4,
        study: true,
        gratitude: true,
        journaling: true,
        journeyTask: daysAgo !== 3,
        dailyChallenge: daysAgo < 5,
        alignmentConfirmed: daysAgo !== 2,
      },
    };
  });
};

const AppContent: React.FC = () => {
  const { user, userProfile: fbProfile, loading: fbLoading } = useFirebase();
  const [currentView, setCurrentView] = useState<AppView>(screenshotPreview ? screenshotView : AppView.WELCOME);
  const [userProfile, setUserProfile] = useState<UserProfile>(screenshotPreview ? screenshotProfile : {
    name: 'Buscador',
    startDate: null,
    awakeningScore: 0,
    hasSeenWarning: false,
    hasAcceptedTerms: false,
    isOnPath: false,
    role: 'client',
  });
  const [logs, setLogs] = useState<DailyLog[]>(() => {
    if (screenshotPreview) {
      return createScreenshotLogs();
    }

    try {
      const saved = localStorage.getItem('reconexao_daily_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNavNudge, setShowNavNudge] = useState(false);

  // Sync local profile with Firebase profile and handle initial routing
  useEffect(() => {
    if (screenshotPreview) {
      return;
    }

    if (fbProfile) {
      setUserProfile(fbProfile);
      
      if (currentView === AppView.WELCOME || currentView === AppView.DISCLAIMER) {
        if (fbProfile.isOnPath) {
          setCurrentView(AppView.DASHBOARD);
        } else {
          setCurrentView(AppView.INSTRUCTIONS);
        }
      }
    }
  }, [fbProfile]);

  // Enforce login gate - do not allow browsing inside the app if logged out
  useEffect(() => {
    if (screenshotPreview) {
      return;
    }

    if (!fbLoading && !user) {
      if (currentView !== AppView.WELCOME && currentView !== AppView.DISCLAIMER) {
        setCurrentView(AppView.WELCOME);
      }
    }
  }, [user, fbLoading, currentView]);

  // Sync logs from Firebase
  useEffect(() => {
    if (screenshotPreview) {
      return;
    }

    if (user) {
      const logsRef = collection(db, 'users', user.uid, 'logs');
      const q = query(logsRef, orderBy('date', 'desc'), limit(30));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedLogs = snapshot.docs.map(doc => doc.data() as DailyLog);
        setLogs(fetchedLogs);
        try {
          localStorage.setItem('reconexao_daily_logs', JSON.stringify(fetchedLogs));
        } catch (e) {}
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Trigger nudge on view change
  useEffect(() => {
    if (!screenshotPreview && userProfile.isOnPath && currentView !== AppView.WELCOME && currentView !== AppView.DIAGNOSIS && currentView !== AppView.INSTRUCTIONS) {
      setShowNavNudge(true);
      const timer = setTimeout(() => {
        setShowNavNudge(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentView, userProfile.isOnPath]);

  const handleDiagnosisComplete = async (score: number, name: string, favoriteActivities: string[]) => {
    const updates = {
      name: name,
      awakeningScore: score,
      hasSeenWarning: true,
      startDate: new Date().toISOString(),
      isOnPath: true,
      favoriteActivities: favoriteActivities
    };

    setUserProfile(prev => ({ ...prev, ...updates }));

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { ...userProfile, ...updates }, { merge: true });
        if (isBackendConfigured) {
          await syncBackendUser({ ...userProfile, ...updates });
        }
      } catch (err) {
        console.error("Error saving profile:", err);
      }
    }

    setTimeout(() => setCurrentView(AppView.DASHBOARD), 1000);
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
        await setDoc(doc(db, 'users', user.uid, 'logs', log.date), log);
        if (isBackendConfigured) {
          await saveBackendJournalEntry(log, userProfile);
        }
      } catch (err) {
        console.error("Error saving log:", err);
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
        await setDoc(doc(db, 'users', user.uid, 'logs', today), newLog);
        if (isBackendConfigured) {
          await saveBackendJournalEntry(newLog, userProfile);
        }
      } catch (err) {
        console.error("Error toggling goal:", err);
      }
    }
  };

  const handleAcceptDisclaimer = async (email: string) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return;
    }

    let acceptedProfile = userProfile;

    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      acceptedProfile = {
        name: 'Buscador',
        email,
        startDate: null,
        awakeningScore: 0,
        hasSeenWarning: true,
        hasAcceptedTerms: true,
        isOnPath: false,
        role: 'client',
      };
      await setDoc(userDocRef, acceptedProfile);
    } else {
      const savedProfile = userDoc.data() as UserProfile;
      acceptedProfile = { ...savedProfile, hasAcceptedTerms: true, role: savedProfile.role ?? 'client' };

      if (!savedProfile.hasAcceptedTerms || !savedProfile.role) {
        await setDoc(userDocRef, {
          hasAcceptedTerms: true,
          role: acceptedProfile.role,
        }, { merge: true });
      }
    }

    setUserProfile(acceptedProfile);

    if (isBackendConfigured) {
      await syncBackendUser(acceptedProfile, email);
      await saveBackendConsent();
    }

    if (acceptedProfile.isOnPath) {
      setCurrentView(AppView.DASHBOARD);
    } else {
      setCurrentView(AppView.INSTRUCTIONS);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
        if (isBackendConfigured) {
          await syncBackendUser({ ...userProfile, ...updates });
        }
      } catch (err) {
        console.error("Error updating profile:", err);
      }
    }
  };

  if (fbLoading && !screenshotPreview) {
    return (
      <div className="app-shell bg-ethereal-950 flex items-center justify-center">
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
        return <WelcomeCover onStart={() => setCurrentView(AppView.DISCLAIMER)} preview={screenshotPreview} />;
      case AppView.DISCLAIMER:
        return <DisclaimerScreen onAccept={handleAcceptDisclaimer} />;
      case AppView.INSTRUCTIONS:
        return <InstructionPortal onProceed={() => setCurrentView(userProfile.isOnPath ? AppView.DASHBOARD : AppView.DIAGNOSIS)} />;
      case AppView.DIAGNOSIS:
        return <Diagnosis onComplete={handleDiagnosisComplete} userProfile={userProfile} />;
      case AppView.DASHBOARD:
        return <Dashboard userProfile={userProfile} logs={logs} onToggleGoal={toggleDailyGoal} setView={setCurrentView} preview={screenshotPreview} />;
      case AppView.TRACKER:
        return <Tracker onSaveLog={handleSaveLog} logs={logs} />;
      case AppView.WELLNESS:
        return <Wellness />;
      case AppView.GUIDANCE:
        return <Guidance userProfile={userProfile} />;
      case AppView.COMMUNITY:
        return <Community />;
      case AppView.JOURNEY:
        return <Journey userProfile={userProfile} preview={screenshotPreview} />;
      case AppView.EVOLUTION:
        return <EvolutionReport logs={logs} userProfile={userProfile} />;
      case AppView.SETTINGS:
        return <Settings userProfile={userProfile} onUpdateProfile={handleUpdateProfile} setView={setCurrentView} />;
      default:
        return <Dashboard userProfile={userProfile} logs={logs} onToggleGoal={toggleDailyGoal} />;
    }
  };

  return (
    <div className="app-shell bg-ethereal-950 text-gray-100 font-sans selection:bg-magic-gold/30">
      <main className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-transparent min-h-screen shadow-2xl relative overflow-x-hidden px-2 sm:px-4 md:px-6">
        
        <div className="app-route relative z-10">{renderView()}</div>
        
        {/* Nudge Toast for Navigation */}
        {showNavNudge && currentView !== AppView.INSTRUCTIONS && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-sm animate-in slide-up" style={{ bottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="glass-mystic p-4 rounded-2xl border border-magic-gold/20 flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-ethereal-950/80 backdrop-blur-xl">
               <div className="shrink-0 p-2 bg-magic-gold/10 rounded-lg text-magic-gold">
                  <Compass size={18} className="animate-spin-slow" />
               </div>
               <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-magic-gold">Voz da Centelha</p>
                  <p className="text-[11px] text-ethereal-100 italic leading-relaxed">Honre seu tempo peregrinando por todos os portais da senda.</p>
               </div>
               <button onClick={() => setShowNavNudge(false)} className="text-ethereal-500 hover:text-white transition-colors">
                  <X size={14} />
               </button>
            </div>
          </div>
        )}

        <div className="fixed top-[-10%] left-[-10%] w-full h-full bg-aura-violet/10 blur-[150px] pointer-events-none rounded-full animate-pulse-soft" />
        <div className="fixed bottom-[-10%] right-[-10%] w-full h-full bg-aura-teal/10 blur-[150px] pointer-events-none rounded-full animate-pulse-soft" style={{ animationDelay: '-2s' }} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-aura-rose/5 blur-[200px] pointer-events-none rounded-full animate-pulse-soft" style={{ animationDelay: '-4s' }} />
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
