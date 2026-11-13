import React, { useEffect, useState } from 'react';
import { PacienteDetails, getPacienteById } from '../lib/db';
import { calculateAge, calculateIMC } from '../lib/formatters';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  Scale,
  Ruler,
  Activity,
  Heart,
  AlertCircle,
  FileText,
  Clock,
  Droplets,
  CheckCircle2
} from 'lucide-react';

interface PacienteProfileProps {
  pacienteId: string;
  nutricionistaId: string;
  onBack: () => void;
  successMessage?: string | null;
}

export const PacienteProfile: React.FC<PacienteProfileProps> = ({
  pacienteId,
  nutricionistaId,
  onBack,
  successMessage,
}) => {
  const [paciente, setPaciente] = useState<PacienteDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getPacienteById(pacienteId, nutricionistaId);
        setPaciente(data);
      } catch (err) {
        console.error('Erro ao buscar detalhes do paciente:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [pacienteId, nutricionistaId]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Carregando prontuário...</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-600 mb-4">Paciente não encontrado ou sem permissão de acesso.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Voltar para a Lista
        </button>
      </div>
    );
  }

  const idade = paciente.data_nascimento ? calculateAge(paciente.data_nascimento) : null;
  const { imc, classificacao } = calculateIMC(paciente.peso_inicial, paciente.altura);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Alerta de Sucesso (exibido logo após o cadastro) */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header com Navegação e Resumo */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Pacientes</span>
        </button>
      </div>

      {/* Cartão de Identificação Principal */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-emerald-600/20">
              {paciente.nome[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{paciente.nome}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                {idade !== null && <span>{idade} anos</span>}
                {paciente.sexo && <span>• {paciente.sexo}</span>}
                {paciente.data_nascimento && (
                  <span>• Nasc: {new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1 text-xs text-slate-500">
            {paciente.whatsapp && (
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> {paciente.whatsapp}
              </span>
            )}
            {paciente.email && (
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Mail className="w-3.5 h-3.5 text-emerald-600" /> {paciente.email}
              </span>
            )}
          </div>
        </div>

        {/* Métricas Corporais Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peso Inicial</span>
              <span className="text-base font-bold text-slate-900">
                {paciente.peso_inicial ? `${paciente.peso_inicial} kg` : '--'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Altura</span>
              <span className="text-base font-bold text-slate-900">
                {paciente.altura ? `${paciente.altura} cm` : '--'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IMC</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">{imc ? `${imc}` : '--'}</span>
                {classificacao && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {classificacao}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seções Clínicas e Hábitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Perfil Clínico */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Informações Clínicas</span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Objetivo
            </span>
            <div className="flex flex-wrap gap-1.5">
              {paciente.objetivos && paciente.objetivos.length > 0 ? (
                paciente.objetivos.map((o) => (
                  <span
                    key={o}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    {o}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Não especificado</span>
              )}
            </div>
            {paciente.objetivo_texto && (
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                "{paciente.objetivo_texto}"
              </p>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Nível de Atividade Física
            </span>
            <span className="text-xs text-slate-700 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
              {paciente.nivel_atividade || 'Não informado'}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Patologias
            </span>
            <p className="text-xs text-slate-700">
              {paciente.patologias && paciente.patologias.length > 0
                ? paciente.patologias.join(', ')
                : 'Nenhuma registrada'}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Restrições Alimentares
            </span>
            <p className="text-xs text-slate-700">
              {paciente.restricoes_alimentares && paciente.restricoes_alimentares.length > 0
                ? paciente.restricoes_alimentares.join(', ')
                : 'Nenhuma'}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Alergias Alimentares
            </span>
            <p className="text-xs text-slate-700">
              {paciente.alergias && paciente.alergias.length > 0
                ? paciente.alergias.join(', ')
                : 'Nenhuma'}
            </p>
          </div>

          {(paciente.medicamentos || paciente.suplementos) && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {paciente.medicamentos && (
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Medicamentos
                  </span>
                  <p className="text-xs text-slate-700 mt-0.5">{paciente.medicamentos}</p>
                </div>
              )}
              {paciente.suplementos && (
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Suplementos
                  </span>
                  <p className="text-xs text-slate-700 mt-0.5">{paciente.suplementos}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card: Hábitos & Rotina */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <Heart className="w-4 h-4 text-emerald-600" />
            <span>Hábitos & Rotina Diária</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Refeições / dia
              </span>
              <span className="text-sm font-bold text-slate-800">
                {paciente.refeicoes_por_dia ? `${paciente.refeicoes_por_dia} refeições` : '--'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Consumo de Água
              </span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                {paciente.litros_agua ? `${paciente.litros_agua} litros` : '--'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Acorda às
              </span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {paciente.horario_acorda || '--'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Dorme às
              </span>
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                {paciente.horario_dorme || '--'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Prática de Atividade Física
            </span>
            <p className="text-xs text-slate-700">
              {paciente.atividade_fisica === true
                ? `Sim: ${paciente.atividade_fisica_descricao || 'Sem descrição'}`
                : paciente.atividade_fisica === false
                ? 'Não pratica'
                : 'Não informado'}
            </p>
          </div>

          {paciente.observacoes && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Observações Gerais
              </span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                {paciente.observacoes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

