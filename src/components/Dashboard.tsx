import React, { useEffect, useState } from 'react';
import { authClient } from '../lib/auth-client';
import {
  getDashboardMetrics,
  getPacientesList,
  DashboardMetrics,
  PacienteListItem
} from '../lib/db';
import { PacientesList } from './PacientesList';
import { PacienteForm } from './PacienteForm';
import { PacienteProfile } from './PacienteProfile';
import {
  Activity,
  LogOut,
  Users,
  Calendar,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Clock,
  Sparkles,
  LayoutDashboard,
  UserCheck,
  CalendarCheck
} from 'lucide-react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
  currentTab: 'dashboard' | 'pacientes';
  onNavigateTab: (tab: 'dashboard' | 'pacientes') => void;
  selectedPatientId?: string | null;
  onSelectPatient?: (id: string | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onLogout,
  currentTab,
  onNavigateTab,
  selectedPatientId: externalSelectedPatientId,
  onSelectPatient: externalOnSelectPatient,
}) => {
  // Estado das métricas
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalPacientesAtivos: 0,
    consultasSemana: 0,
    pacientesSemRetorno: [],
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estado dos pacientes
  const [pacientes, setPacientes] = useState<PacienteListItem[]>([]);
  const [pacientesLoading, setPacientesLoading] = useState(true);

  // Sub-visões dentro da aba Pacientes: 'list' | 'create' | 'profile'
  const [pacienteView, setPacienteView] = useState<'list' | 'create' | 'profile'>('list');
  const [internalSelectedPatientId, setInternalSelectedPatientId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const activePatientId = externalSelectedPatientId || internalSelectedPatientId;

  // Carrega métricas do dashboard
  const fetchMetrics = async (isManual = false) => {
    if (!user?.id) return;
    if (isManual) setRefreshing(true);
    else setMetricsLoading(true);

    try {
      const data = await getDashboardMetrics(user.id);
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar dados do Neon:', err);
    } finally {
      setMetricsLoading(false);
      setRefreshing(false);
    }
  };

  // Carrega lista de pacientes
  const fetchPacientes = async () => {
    if (!user?.id) return;
    setPacientesLoading(true);
    try {
      const list = await getPacientesList(user.id);
      setPacientes(list);
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err);
    } finally {
      setPacientesLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchPacientes();
  }, [user?.id]);

  useEffect(() => {
    if (externalSelectedPatientId) {
      setPacienteView('profile');
    }
  }, [externalSelectedPatientId]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
    onLogout();
  };

  const handleOpenPatientProfile = (patientId: string) => {
    if (externalOnSelectPatient) {
      externalOnSelectPatient(patientId);
    }
    setInternalSelectedPatientId(patientId);
    setPacienteView('profile');
    onNavigateTab('pacientes');
  };

  const handlePatientCreated = (newPatientId: string) => {
    setSuccessToast('Paciente cadastrado com sucesso!');
    fetchPacientes();
    fetchMetrics();
    if (externalOnSelectPatient) {
      externalOnSelectPatient(newPatientId);
    }
    setInternalSelectedPatientId(newPatientId);
    setPacienteView('profile');
    onNavigateTab('pacientes');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Background sutil */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/60 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-100/60 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-100/40 rounded-full blur-[120px]" />
      </div>

      {/* Menu Lateral Fixo */}
      <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-300 shadow-sm">
        {/* Topo / Logotipo Nutri GF */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-[1px] shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-emerald-600 rounded-[11px] flex items-center justify-center text-white">
                <Activity className="w-5 h-5 group-hover:scale-110 transition duration-300" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-lg tracking-tight">Nutri GF</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">Gestão Clínica Inteligente</span>
          </div>
        </div>

        {/* Links de Navegação Fixos: Dashboard, Pacientes */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => {
              onNavigateTab('dashboard');
              setSuccessToast(null);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>Dashboard</span>
            {currentTab === 'dashboard' && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600" />
            )}
          </button>

          <button
            onClick={() => {
              onNavigateTab('pacientes');
              setPacienteView('list');
              if (externalOnSelectPatient) externalOnSelectPatient(null);
              setInternalSelectedPatientId(null);
              setSuccessToast(null);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              currentTab === 'pacientes'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Users className={`w-4 h-4 ${currentTab === 'pacientes' ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>Pacientes</span>
            {currentTab === 'pacientes' && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600" />
            )}
          </button>
        </nav>

        {/* Perfil & Logout no Rodapé da Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">
                {(user?.name || 'Nutri')[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-800 truncate block">
                  {user?.name || 'Nutricionista'}
                </span>
                <span className="text-[11px] text-slate-500 truncate block">{user?.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
        {/* Topo / Header da Área Principal */}
        <header className="h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {currentTab === 'dashboard' ? 'Painel Geral' : 'Área de Pacientes'}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Neon Conectado
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentTab === 'dashboard'
                  ? 'Visão consolidada em tempo real'
                  : 'Prontuário eletrônico e cadastro clínico'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchMetrics(true);
                fetchPacientes();
              }}
              disabled={refreshing || metricsLoading || pacientesLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{refreshing ? 'Atualizando...' : 'Sincronizar'}</span>
            </button>
          </div>
        </header>

        {/* Conteúdo Principal Alternável */}
        <main className="flex-1 p-8 max-w-7xl w-full">
          {currentTab === 'dashboard' ? (
            /* VISÃO DO DASHBOARD (PROMPT 3) */
            <>
              {/* Banner de Boas-Vindas */}
              <div className="relative mb-8 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-50/70 to-transparent pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Ambiente Clínico
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Olá, {user?.name || 'Nutricionista'} 👋
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 max-w-xl">
                      Aqui está o panorama em tempo real de seus pacientes ativos, consultas agendadas e retornos pendentes sincronizados com seu banco Neon.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl self-start sm:self-auto">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Status do Sistema</span>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        Sincronizado Neon DB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid dos Cards Principais */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card 1 — Total de pacientes ativos */}
                <div className="relative group rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-2xl" />
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        Pacientes Ativos
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition duration-300">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        {metricsLoading ? (
                          <span className="inline-block w-12 h-9 bg-slate-100 rounded animate-pulse" />
                        ) : (
                          metrics.totalPacientesAtivos
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Pacientes cadastrados sob a sua responsabilidade clínica.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Filtrado por: sua conta</span>
                    <button
                      onClick={() => {
                        onNavigateTab('pacientes');
                        setPacienteView('list');
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      Ver todos <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Card 2 — Consultas da semana */}
                <div className="relative group rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-300 flex flex-col justify-between">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-t-2xl" />
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4 text-teal-600" />
                        Consultas da Semana
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-105 transition duration-300">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        {metricsLoading ? (
                          <span className="inline-block w-12 h-9 bg-slate-100 rounded animate-pulse" />
                        ) : (
                          metrics.consultasSemana
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Atendimentos registrados no período da semana atual.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Período: Semana corrente</span>
                    <span className="text-teal-700 font-semibold">Tempo real</span>
                  </div>
                </div>

                {/* Card 3 — Pacientes sem retorno */}
                <div className="relative group rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 flex flex-col justify-between">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400 rounded-t-2xl" />
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Pacientes sem Retorno
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-105 transition duration-300">
                        <span className="text-sm font-bold">{metrics.pacientesSemRetorno.length}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">
                      Última consulta há &gt; 30 dias sem retorno agendado:
                    </p>

                    {/* Lista de Pacientes Sem Retorno */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {metricsLoading ? (
                        <div className="space-y-2">
                          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                        </div>
                      ) : metrics.pacientesSemRetorno.length === 0 ? (
                        <div className="py-6 px-4 bg-slate-50 rounded-xl border border-slate-150 text-center">
                          <p className="text-xs font-medium text-slate-500">
                            Nenhum paciente sem retorno no momento
                          </p>
                        </div>
                      ) : (
                        metrics.pacientesSemRetorno.map((paciente) => (
                          <button
                            key={paciente.id}
                            onClick={() => handleOpenPatientProfile(paciente.id)}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/70 hover:border-emerald-200 transition text-left cursor-pointer group/item"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-semibold text-slate-800 group-hover/item:text-emerald-700 transition block truncate">
                                {paciente.nome}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Última: {paciente.data_ultima_consulta || 'Sem data'} ({paciente.dias_sem_consulta}d atrás)
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-emerald-600 group-hover/item:translate-x-0.5 transition flex-shrink-0" />
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Critério: &gt; 30 dias sem agendamento</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* VISÃO DE PACIENTES (PROMPT 4) */
            <>
              {pacienteView === 'list' && (
                <PacientesList
                  pacientes={pacientes}
                  loading={pacientesLoading}
                  onNewPaciente={() => setPacienteView('create')}
                  onSelectPaciente={(id) => handleOpenPatientProfile(id)}
                />
              )}

              {pacienteView === 'create' && (
                <PacienteForm
                  nutricionistaId={user.id}
                  onSuccess={(newId) => handlePatientCreated(newId)}
                  onCancel={() => setPacienteView('list')}
                />
              )}

              {pacienteView === 'profile' && activePatientId && (
                <PacienteProfile
                  pacienteId={activePatientId}
                  nutricionistaId={user.id}
                  successMessage={successToast}
                  onBack={() => {
                    setPacienteView('list');
                    setSuccessToast(null);
                    if (externalOnSelectPatient) externalOnSelectPatient(null);
                    setInternalSelectedPatientId(null);
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
