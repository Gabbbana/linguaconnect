import { useEffect, useState } from 'react';
import { AppShell } from './components/AppShell';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RealtimeProvider, useRealtime } from './context/RealtimeContext';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LanguageSelectScreen } from './screens/LanguageSelectScreen';
import { OnlinePartnersScreen } from './screens/OnlinePartnersScreen';
import { CallScreen } from './screens/CallScreen';

type Screen = 'language' | 'match' | 'call';

function AuthedApp() {
  const [screen, setScreen] = useState<Screen>('language');
  const [language, setLanguage] = useState<string | null>(null);
  const { matched, clearMatched, callEnded, clearCallEnded } = useRealtime();

  useEffect(() => {
    if (matched) setScreen('call');
  }, [matched]);

  useEffect(() => {
    if (callEnded) {
      setScreen('match');
      clearCallEnded();
    }
  }, [callEnded]);

  if (screen === 'language') {
    return (
      <LanguageSelectScreen
        onContinue={(lang) => {
          setLanguage(lang);
          setScreen('match');
        }}
      />
    );
  }

  if (screen === 'match' && language) {
    return <OnlinePartnersScreen language={language} onBack={() => setScreen('language')} />;
  }

  if (screen === 'call' && matched) {
    return (
      <CallScreen
        matched={matched}
        onEnded={() => {
          clearMatched();
          setScreen('match');
        }}
      />
    );
  }

  return null;
}

function Root() {
  const { user } = useAuth();
  return <AppShell>{user ? <AuthedApp /> : <WelcomeScreen />}</AppShell>;
}

export default function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <Root />
      </RealtimeProvider>
    </AuthProvider>
  );
}
