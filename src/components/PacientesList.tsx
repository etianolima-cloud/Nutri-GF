import React, { useState, useMemo } from 'react';
import { PacienteListItem } from '../lib/db';
import {
  Search,
  UserPlus,
  Users,
  ChevronRight,
  Calendar,
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PacientesListProps {
  pacientes: PacienteListItem[];
  loading: boolean;
  onNewPaciente: () => void;
  onSelectPaciente: (id: string) => void;
}

export const PacientesList: React.FC<PacientesListProps> = ({
  pacientes,
  loading,
  onNewPaciente,
  onSelectPaciente,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPacientes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return pacientes;
    return pacientes.filter((p) => p.nome.toLowerCase().includes(term));
  }, [pacientes, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Topo com Título, Estatísticas e Botão Novo Paciente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Gestão de Pacientes
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {pacientes.length} {pacientes.length === 1 ? 'cadastrado' : 'cadastrados'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize a lista completa, histórico e prontuários dos seus pacientes
          </p>
        </div>

        <button
          onClick={onNewPaciente}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Paciente</span>
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar paciente por nome..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/90 rounded-2xl text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Conteúdo da Listagem */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/70 p-4 flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="space-y-2">
                  <div className="w-36 h-4 bg-slate-100 rounded" />
                  <div className="w-24 h-3 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-20 h-4 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : pacientes.length === 0 ? (
        /* Estado Vazio — Nenhum paciente no banco */
        <div className="py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum paciente cadastrado ainda</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Você ainda não possui pacientes vinculados ao seu prontuário clínico. Cadastre o primeiro para iniciar o acompanhamento.
          </p>
          <button
            onClick={onNewPaciente}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Primeiro Paciente</span>
          </button>
        </div>
      ) : filteredPacientes.length === 0 ? (
        /* Estado Vazio — Busca sem resultados */
        <div className="py-12 px-4 bg-white rounded-2xl border border-slate-200 text-center">
          <p className="text-sm font-semibold text-slate-700">Nenhum paciente encontrado para "{searchTerm}"</p>
          <p className="text-xs text-slate-400 mt-1">Verifique o nome digitado ou limpe a busca.</p>
        </div>
      ) : (
        /* Tabela / Grid de Pacientes */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredPacientes.map((p) => {
              // Formatação de objetivos
              const objetivosList = Array.isArray(p.objetivos) ? p.objetivos : [];
              const objetivoExibicao = objetivosList.length > 0 
                ? objetivosList.join(', ')
                : (p.objetivo_texto || 'Não informado');

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPaciente(p.id)}
                  className="p-4 sm:p-5 hover:bg-emerald-50/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200/70 text-emerald-800 flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:scale-105 transition">
                      {p.nome[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                        {p.nome}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                        <Target className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">Objetivo: <strong className="text-slate-700 font-medium">{objetivoExibicao}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Última Consulta
                      </span>
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{p.ultima_consulta || 'Sem consultas'}</span>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 flex items-center justify-center transition">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

