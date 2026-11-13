import React, { useState } from 'react';
import {
  formatPhone,
  formatTimeInput,
  calculateAge,
  calculateIMC
} from '../lib/formatters';
import { createPaciente } from '../lib/db';
import {
  ArrowLeft,
  User,
  Activity,
  Heart,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';

interface PacienteFormProps {
  nutricionistaId: string;
  onSuccess: (newPatientId: string) => void;
  onCancel: () => void;
}

const OBJETIVOS_OPCOES = [
  'Emagrecer',
  'Ganhar massa',
  'Controlar diabetes',
  'Saúde geral',
  'Performance esportiva',
  'Reeducação alimentar',
];

const NIVEIS_ATIVIDADE = [
  'Sedentário',
  'Levemente ativo',
  'Moderadamente ativo',
  'Muito ativo',
  'Extremamente ativo',
];

const PATOLOGIAS_OPCOES = [
  'Diabetes',
  'Hipertensão',
  'Hipotireoidismo',
  'Hipertireoidismo',
  'Síndrome do ovário policístico',
  'Doença celíaca',
  'Colesterol alto',
];

const RESTRICOES_OPCOES = [
  'Lactose',
  'Glúten',
  'Açúcar',
  'Carne vermelha',
  'Frutos do mar',
];

const ALERGIAS_OPCOES = [
  'Amendoim',
  'Leite',
  'Ovo',
  'Soja',
  'Trigo',
  'Frutos do mar',
];

export const PacienteForm: React.FC<PacienteFormProps> = ({
  nutricionistaId,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'pessoal' | 'clinico' | 'habitos'>('pessoal');

  // Aba 1 - Pessoal
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Aba 2 - Clínico
  const [pesoKg, setPesoKg] = useState<string>('');
  const [alturaCm, setAlturaCm] = useState<string>('');
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [objetivoTexto, setObjetivoTexto] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');

  const [patologias, setPatologias] = useState<string[]>([]);
  const [novaPatologia, setNovaPatologia] = useState('');

  const [restricoes, setRestricoes] = useState<string[]>([]);
  const [novaRestricao, setNovaRestricao] = useState('');

  const [alergias, setAlergias] = useState<string[]>([]);
  const [novaAlergia, setNovaAlergia] = useState('');

  const [medicamentos, setMedicamentos] = useState('');
  const [suplementos, setSuplementos] = useState('');

  // Aba 3 - Hábitos
  const [refeicoesPorDia, setRefeicoesPorDia] = useState<string>('');
  const [horarioAcorda, setHorarioAcorda] = useState('');
  const [horarioDorme, setHorarioDorme] = useState('');
  const [litrosAgua, setLitrosAgua] = useState<string>('');
  const [praticaAtividade, setPraticaAtividade] = useState<boolean | null>(null);
  const [atividadeDescricao, setAtividadeDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Estados de feedback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cálculos dinâmicos
  const idade = calculateAge(dataNascimento);
  const pesoNum = pesoKg ? parseFloat(pesoKg.replace(',', '.')) : null;
  const alturaNum = alturaCm ? parseFloat(alturaCm.replace(',', '.')) : null;
  const { imc, classificacao } = calculateIMC(pesoNum, alturaNum);

  // Toggle em listas com suporte a "Nenhum"
  const toggleSelectionWithNenhum = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (item === 'Nenhum') {
      if (currentList.includes('Nenhum')) {
        setList([]);
      } else {
        setList(['Nenhum']);
      }
      return;
    }

    const withoutNenhum = currentList.filter((i) => i !== 'Nenhum');
    if (withoutNenhum.includes(item)) {
      setList(withoutNenhum.filter((i) => i !== item));
    } else {
      setList([...withoutNenhum, item]);
    }
  };

  const toggleSimpleSelection = (
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (currentList.includes(item)) {
      setList(currentList.filter((i) => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const handleAddCustomItem = (
    item: string,
    setItem: React.Dispatch<React.SetStateAction<string>>,
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    const withoutNenhum = currentList.filter((i) => i !== 'Nenhum');
    if (!withoutNenhum.includes(trimmed)) {
      setList([...withoutNenhum, trimmed]);
    }
    setItem('');
  };

  const handleRemoveCustomItem = (
    item: string,
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(currentList.filter((i) => i !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim()) {
      setError('O nome completo do paciente é obrigatório.');
      setActiveTab('pessoal');
      return;
    }

    setSubmitting(true);
    try {
      const newId = await createPaciente({
        nutricionista_id: nutricionistaId,
        nome: nome.trim(),
        data_nascimento: dataNascimento || null,
        sexo: sexo || null,
        whatsapp: whatsapp ? whatsapp.trim() : (telefone ? telefone.trim() : null),
        email: email ? email.trim().toLowerCase() : null,
        peso_inicial: pesoNum,
        altura: alturaNum,
        objetivos: objetivos,
        objetivo_texto: objetivoTexto ? objetivoTexto.trim() : null,
        nivel_atividade: nivelAtividade || null,
        patologias: patologias,
        restricoes_alimentares: restricoes,
        alergias: alergias,
        medicamentos: medicamentos ? medicamentos.trim() : null,
        suplementos: suplementos ? suplementos.trim() : null,
        refeicoes_por_dia: refeicoesPorDia ? parseInt(refeicoesPorDia, 10) : null,
        horario_acorda: horarioAcorda || null,
        horario_dorme: horarioDorme || null,
        litros_agua: litrosAgua ? parseFloat(litrosAgua.replace(',', '.')) : null,
        atividade_fisica: praticaAtividade,
        atividade_fisica_descricao: praticaAtividade ? atividadeDescricao.trim() : null,
        observacoes: observacoes ? observacoes.trim() : null,
      });

      onSuccess(newId);
    } catch (err: any) {
      console.error('Erro ao cadastrar paciente:', err);
      setError(err?.message || 'Erro ao salvar paciente no Neon DB. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2">
      {/* Topo do Formulário */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl border border-slate-200 transition cursor-pointer shadow-xs"
            title="Voltar para a listagem"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cadastrar Novo Paciente</h2>
            <p className="text-xs text-slate-500">
              Preencha os dados do prontuário para acompanhamento nutricional
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{submitting ? 'Salvando...' : 'Salvar Paciente'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Abas de Navegação */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-2xl p-1.5 shadow-xs border">
        <button
          type="button"
          onClick={() => setActiveTab('pessoal')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'pessoal'
              ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>1. Dados Pessoais</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clinico')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'clinico'
              ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>2. Dados Clínicos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('habitos')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition cursor-pointer ${
            activeTab === 'habitos'
              ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>3. Hábitos & Rotina</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ABA 1: PESSOAL */}
        {activeTab === 'pessoal' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nome Completo <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Carlos Eduardo de Oliveira"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Data de Nascimento
                  </label>
                  {idade !== null && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {idade} {idade === 1 ? 'ano' : 'anos'}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Sexo
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Feminino', 'Masculino', 'Outro'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSexo(item)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                        sexo === item
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paciente@exemplo.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('clinico')}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Próximo: Dados Clínicos →
              </button>
            </div>
          </div>
        )}

        {/* ABA 2: CLÍNICO */}
        {activeTab === 'clinico' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Peso, Altura e IMC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Peso Atual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={pesoKg}
                    onChange={(e) => setPesoKg(e.target.value)}
                    placeholder="70.5"
                    className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Altura
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="30"
                    value={alturaCm}
                    onChange={(e) => setAlturaCm(e.target.value)}
                    placeholder="175"
                    className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    cm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  IMC (Automático)
                </label>
                <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">
                    {imc ? `${imc} kg/m²` : '--'}
                  </span>
                  {classificacao && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {classificacao}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Objetivos */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Objetivo do Paciente (Múltipla escolha)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {OBJETIVOS_OPCOES.map((obj) => {
                  const selected = objetivos.includes(obj);
                  return (
                    <button
                      key={obj}
                      type="button"
                      onClick={() => toggleSimpleSelection(objetivos, setObjetivos, obj)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {obj}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={objetivoTexto}
                onChange={(e) => setObjetivoTexto(e.target.value)}
                placeholder="Observações complementares sobre o objetivo (opcional)..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>

            {/* Nível de atividade física */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nível de Atividade Física (Seleção única)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {NIVEIS_ATIVIDADE.map((nivel) => (
                  <button
                    key={nivel}
                    type="button"
                    onClick={() => setNivelAtividade(nivel)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer text-center truncate ${
                      nivelAtividade === nivel
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {nivel}
                  </button>
                ))}
              </div>
            </div>

            {/* Patologias ou condições de saúde */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Patologias ou Condições de Saúde
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => toggleSelectionWithNenhum(patologias, setPatologias, 'Nenhum')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    patologias.includes('Nenhum')
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Nenhum
                </button>
                {PATOLOGIAS_OPCOES.map((pat) => {
                  const selected = patologias.includes(pat);
                  return (
                    <button
                      key={pat}
                      type="button"
                      disabled={patologias.includes('Nenhum')}
                      onClick={() => toggleSelectionWithNenhum(patologias, setPatologias, pat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-40 ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pat}
                    </button>
                  );
                })}
              </div>

              {/* Itens adicionados livremente */}
              {patologias.filter((p) => !PATOLOGIAS_OPCOES.includes(p) && p !== 'Nenhum').length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {patologias
                    .filter((p) => !PATOLOGIAS_OPCOES.includes(p) && p !== 'Nenhum')
                    .map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomItem(item, patologias, setPatologias)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaPatologia}
                  onChange={(e) => setNovaPatologia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomItem(novaPatologia, setNovaPatologia, patologias, setPatologias);
                    }
                  }}
                  placeholder="Adicionar outra patologia..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomItem(novaPatologia, setNovaPatologia, patologias, setPatologias)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Restrições Alimentares */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Restrições Alimentares
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => toggleSelectionWithNenhum(restricoes, setRestricoes, 'Nenhum')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    restricoes.includes('Nenhum')
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Nenhum
                </button>
                {RESTRICOES_OPCOES.map((res) => {
                  const selected = restricoes.includes(res);
                  return (
                    <button
                      key={res}
                      type="button"
                      disabled={restricoes.includes('Nenhum')}
                      onClick={() => toggleSelectionWithNenhum(restricoes, setRestricoes, res)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-40 ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {res}
                    </button>
                  );
                })}
              </div>

              {/* Personalizados */}
              {restricoes.filter((r) => !RESTRICOES_OPCOES.includes(r) && r !== 'Nenhum').length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {restricoes
                    .filter((r) => !RESTRICOES_OPCOES.includes(r) && r !== 'Nenhum')
                    .map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomItem(item, restricoes, setRestricoes)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaRestricao}
                  onChange={(e) => setNovaRestricao(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomItem(novaRestricao, setNovaRestricao, restricoes, setRestricoes);
                    }
                  }}
                  placeholder="Adicionar outra restrição..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomItem(novaRestricao, setNovaRestricao, restricoes, setRestricoes)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Alergias Alimentares */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Alergias Alimentares
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => toggleSelectionWithNenhum(alergias, setAlergias, 'Nenhum')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    alergias.includes('Nenhum')
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Nenhum
                </button>
                {ALERGIAS_OPCOES.map((ale) => {
                  const selected = alergias.includes(ale);
                  return (
                    <button
                      key={ale}
                      type="button"
                      disabled={alergias.includes('Nenhum')}
                      onClick={() => toggleSelectionWithNenhum(alergias, setAlergias, ale)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-40 ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ale}
                    </button>
                  );
                })}
              </div>

              {/* Personalizados */}
              {alergias.filter((a) => !ALERGIAS_OPCOES.includes(a) && a !== 'Nenhum').length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {alergias
                    .filter((a) => !ALERGIAS_OPCOES.includes(a) && a !== 'Nenhum')
                    .map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomItem(item, alergias, setAlergias)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaAlergia}
                  onChange={(e) => setNovaAlergia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomItem(novaAlergia, setNovaAlergia, alergias, setAlergias);
                    }
                  }}
                  placeholder="Adicionar outra alergia..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
                <button
                  type="button"
                  onClick={() => handleAddCustomItem(novaAlergia, setNovaAlergia, alergias, setAlergias)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            {/* Medicamentos e Suplementos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Medicamentos Contínuos
                </label>
                <textarea
                  rows={3}
                  value={medicamentos}
                  onChange={(e) => setMedicamentos(e.target.value)}
                  placeholder="Descreva medicamentos, dosagens e horários..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Suplementos em Uso
                </label>
                <textarea
                  rows={3}
                  value={suplementos}
                  onChange={(e) => setSuplementos(e.target.value)}
                  placeholder="Ex: Creatina 5g, Whey protein, Vitamina D..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('pessoal')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
              >
                ← Voltar para Dados Pessoais
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('habitos')}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Próximo: Hábitos & Rotina →
              </button>
            </div>
          </div>
        )}

        {/* ABA 3: HÁBITOS */}
        {activeTab === 'habitos' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quantas refeições faz por dia
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={refeicoesPorDia}
                  onChange={(e) => setRefeicoesPorDia(e.target.value)}
                  placeholder="Ex: 4"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quantidade de água por dia
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={litrosAgua}
                    onChange={(e) => setLitrosAgua(e.target.value)}
                    placeholder="2.5"
                    className="w-full pl-4 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    litros
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Horário que acorda
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Digite apenas números (ex: 6 vira 06:00, 630 vira 06:30)
                </p>
                <input
                  type="text"
                  value={horarioAcorda}
                  onChange={(e) => setHorarioAcorda(e.target.value)}
                  onBlur={() => setHorarioAcorda(formatTimeInput(horarioAcorda))}
                  placeholder="Ex: 06:30"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Horário que dorme
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Digite apenas números (ex: 23 vira 23:00, 2230 vira 22:30)
                </p>
                <input
                  type="text"
                  value={horarioDorme}
                  onChange={(e) => setHorarioDorme(e.target.value)}
                  onBlur={() => setHorarioDorme(formatTimeInput(horarioDorme))}
                  placeholder="Ex: 22:30"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>
            </div>

            {/* Pratica Atividade Física */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pratica atividade física?
              </label>
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setPraticaAtividade(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    praticaAtividade === true
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPraticaAtividade(false);
                    setAtividadeDescricao('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    praticaAtividade === false
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Não
                </button>
              </div>

              {praticaAtividade && (
                <div className="pt-2 animate-fadeIn">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Qual atividade e frequência semanal?
                  </label>
                  <input
                    type="text"
                    value={atividadeDescricao}
                    onChange={(e) => setAtividadeDescricao(e.target.value)}
                    placeholder="Ex: Musculação 4x na semana, corrida aos sábados"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
              )}
            </div>

            {/* Observações Gerais */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Observações Gerais
              </label>
              <textarea
                rows={4}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Anotações clínicas adicionais, preferências, histórico ou particularidades..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition resize-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('clinico')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
              >
                ← Voltar para Dados Clínicos
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{submitting ? 'Salvando...' : 'Finalizar e Salvar'}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

