import { useEffect, useState } from 'react';
import { authClient } from './lib/auth-client';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { Activity } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'pacientes'>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await authClient.getSession();
        if (error || !data?.user) {
          setUser(null);
        } else {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Erro na verificação de sessão:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Visual de carregamento elegante no tema claro
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-[1px] shadow-lg shadow-emerald-600/20">
            <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center">
              <Activity className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-slate-600 font-medium text-sm">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Carregando Nutri GF...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onSuccess={(loggedUser) => setUser(loggedUser)} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={() => {
        setUser(null);
        setSelectedPatientId(null);
        setCurrentTab('dashboard');
      }}
      currentTab={currentTab}
      onNavigateTab={(tab) => {
        setCurrentTab(tab);
        if (tab === 'dashboard') setSelectedPatientId(null);
      }}
      selectedPatientId={selectedPatientId}
      onSelectPatient={(id) => setSelectedPatientId(id)}
    />
  );
}
