import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL || '';

export const sql = databaseUrl ? neon(databaseUrl) : null;

export async function syncNutricionista(id: string, nome: string, email: string) {
  if (!sql) return;
  try {
    await sql`
      INSERT INTO public.nutricionistas (id, nome, email, created_at)
      VALUES (${id}, ${nome}, ${email}, NOW())
      ON CONFLICT (id) DO UPDATE
      SET nome = EXCLUDED.nome,
          email = EXCLUDED.email;
    `;
  } catch (error) {
    console.error('Erro ao sincronizar nutricionista no banco:', error);
  }
}

export interface PacienteSemRetorno {
  id: string;
  nome: string;
  data_ultima_consulta: string;
  dias_sem_consulta: number;
}

export interface DashboardMetrics {
  totalPacientesAtivos: number;
  consultasSemana: number;
  pacientesSemRetorno: PacienteSemRetorno[];
}

export async function getDashboardMetrics(nutricionistaId: string): Promise<DashboardMetrics> {
  if (!sql || !nutricionistaId) {
    return {
      totalPacientesAtivos: 0,
      consultasSemana: 0,
      pacientesSemRetorno: [],
    };
  }

  try {
    const totalPacientesRes = await sql`
      SELECT COUNT(*)::int AS count
      FROM public.pacientes
      WHERE nutricionista_id = ${nutricionistaId}
    `;
    const totalPacientesAtivos = totalPacientesRes[0]?.count || 0;

    const consultasSemanaRes = await sql`
      SELECT COUNT(*)::int AS count
      FROM public.consultas c
      JOIN public.pacientes p ON c.paciente_id = p.id
      WHERE p.nutricionista_id = ${nutricionistaId}
        AND c.data_consulta >= date_trunc('week', CURRENT_DATE)
        AND c.data_consulta < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
    `;
    const consultasSemana = consultasSemanaRes[0]?.count || 0;

    const pacientesSemRetornoRes = await sql`
      WITH ultimas_consultas AS (
        SELECT 
          p.id AS paciente_id,
          p.nome AS paciente_nome,
          MAX(c.data_consulta) AS ultima_consulta,
          MAX(c.proximo_retorno) AS proximo_retorno
        FROM public.pacientes p
        INNER JOIN public.consultas c ON c.paciente_id = p.id
        WHERE p.nutricionista_id = ${nutricionistaId}
        GROUP BY p.id, p.nome
      )
      SELECT 
        paciente_id AS id,
        paciente_nome AS nome,
        ultima_consulta,
        (CURRENT_DATE - ultima_consulta)::int AS dias_sem_consulta
      FROM ultimas_consultas
      WHERE ultima_consulta < CURRENT_DATE - INTERVAL '30 days'
        AND (proximo_retorno IS NULL OR proximo_retorno < CURRENT_DATE)
      ORDER BY ultima_consulta ASC
    `;

    const pacientesSemRetorno: PacienteSemRetorno[] = pacientesSemRetornoRes.map((r: any) => ({
      id: r.id,
      nome: r.nome,
      data_ultima_consulta: r.ultima_consulta ? new Date(r.ultima_consulta).toLocaleDateString('pt-BR') : '',
      dias_sem_consulta: Number(r.dias_sem_consulta || 0),
    }));

    return {
      totalPacientesAtivos,
      consultasSemana,
      pacientesSemRetorno,
    };
  } catch (error) {
    console.error('Erro ao buscar métricas do dashboard:', error);
    return {
      totalPacientesAtivos: 0,
      consultasSemana: 0,
      pacientesSemRetorno: [],
    };
  }
}

export interface PacienteListItem {
  id: string;
  nome: string;
  objetivos: string[] | null;
  objetivo_texto: string | null;
  ultima_consulta: string | null;
  data_nascimento: string | null;
  telefone?: string | null;
  whatsapp: string | null;
  email: string | null;
  created_at: string | null;
}

export async function getPacientesList(nutricionistaId: string): Promise<PacienteListItem[]> {
  if (!sql || !nutricionistaId) return [];

  try {
    const res = await sql`
      SELECT 
        p.id,
        p.nome,
        p.objetivos,
        p.objetivo_texto,
        p.data_nascimento,
        p.whatsapp,
        p.email,
        p.created_at,
        MAX(c.data_consulta) AS ultima_consulta
      FROM public.pacientes p
      LEFT JOIN public.consultas c ON c.paciente_id = p.id
      WHERE p.nutricionista_id = ${nutricionistaId}
      GROUP BY p.id
      ORDER BY p.nome ASC
    `;

    return res.map((r: any) => ({
      id: r.id,
      nome: r.nome,
      objetivos: Array.isArray(r.objetivos) ? r.objetivos : (r.objetivos ? [r.objetivos] : []),
      objetivo_texto: r.objetivo_texto,
      ultima_consulta: r.ultima_consulta ? new Date(r.ultima_consulta).toLocaleDateString('pt-BR') : null,
      data_nascimento: r.data_nascimento ? new Date(r.data_nascimento).toLocaleDateString('pt-BR') : null,
      whatsapp: r.whatsapp,
      email: r.email,
      created_at: r.created_at,
    }));
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    return [];
  }
}

export interface PacienteDetails {
  id: string;
  nutricionista_id: string;
  nome: string;
  data_nascimento: string | null;
  sexo: string | null;
  whatsapp: string | null;
  email: string | null;
  peso_inicial: number | null;
  altura: number | null;
  objetivos: string[] | null;
  objetivo_texto: string | null;
  nivel_atividade: string | null;
  patologias: string[] | null;
  restricoes_alimentares: string[] | null;
  alergias: string[] | null;
  medicamentos: string | null;
  suplementos: string | null;
  refeicoes_por_dia: number | null;
  horario_acorda: string | null;
  horario_dorme: string | null;
  litros_agua: number | null;
  atividade_fisica: boolean | null;
  atividade_fisica_descricao: string | null;
  observacoes: string | null;
  created_at: string | null;
}

export async function getPacienteById(pacienteId: string, nutricionistaId: string): Promise<PacienteDetails | null> {
  if (!sql || !pacienteId) return null;

  try {
    const res = await sql`
      SELECT *
      FROM public.pacientes
      WHERE id = ${pacienteId}
        AND nutricionista_id = ${nutricionistaId}
      LIMIT 1
    `;

    if (!res.length) return null;
    const r: any = res[0];
    return {
      id: r.id,
      nutricionista_id: r.nutricionista_id,
      nome: r.nome,
      data_nascimento: r.data_nascimento,
      sexo: r.sexo,
      whatsapp: r.whatsapp,
      email: r.email,
      peso_inicial: r.peso_inicial != null ? Number(r.peso_inicial) : null,
      altura: r.altura != null ? Number(r.altura) : null,
      objetivos: Array.isArray(r.objetivos) ? r.objetivos : (r.objetivos ? [r.objetivos] : []),
      objetivo_texto: r.objetivo_texto,
      nivel_atividade: r.nivel_atividade,
      patologias: Array.isArray(r.patologias) ? r.patologias : (r.patologias ? [r.patologias] : []),
      restricoes_alimentares: Array.isArray(r.restricoes_alimentares) ? r.restricoes_alimentares : (r.restricoes_alimentares ? [r.restricoes_alimentares] : []),
      alergias: Array.isArray(r.alergias) ? r.alergias : (r.alergias ? [r.alergias] : []),
      medicamentos: r.medicamentos,
      suplementos: r.suplementos,
      refeicoes_por_dia: r.refeicoes_por_dia != null ? Number(r.refeicoes_por_dia) : null,
      horario_acorda: r.horario_acorda,
      horario_dorme: r.horario_dorme,
      litros_agua: r.litros_agua != null ? Number(r.litros_agua) : null,
      atividade_fisica: r.atividade_fisica,
      atividade_fisica_descricao: r.atividade_fisica_descricao,
      observacoes: r.observacoes,
      created_at: r.created_at,
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do paciente:', error);
    return null;
  }
}

export interface CreatePacienteInput {
  nutricionista_id: string;
  nome: string;
  data_nascimento?: string | null;
  sexo?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  peso_inicial?: number | null;
  altura?: number | null;
  objetivos?: string[];
  objetivo_texto?: string | null;
  nivel_atividade?: string | null;
  patologias?: string[];
  restricoes_alimentares?: string[];
  alergias?: string[];
  medicamentos?: string | null;
  suplementos?: string | null;
  refeicoes_por_dia?: number | null;
  horario_acorda?: string | null;
  horario_dorme?: string | null;
  litros_agua?: number | null;
  atividade_fisica?: boolean | null;
  atividade_fisica_descricao?: string | null;
  observacoes?: string | null;
}

export async function createPaciente(data: CreatePacienteInput): Promise<string> {
  if (!sql) throw new Error('Conexão com o banco Neon não inicializada.');

  const res = await sql`
    INSERT INTO public.pacientes (
      nutricionista_id,
      nome,
      data_nascimento,
      sexo,
      whatsapp,
      email,
      peso_inicial,
      altura,
      objetivos,
      objetivo_texto,
      nivel_atividade,
      patologias,
      restricoes_alimentares,
      alergias,
      medicamentos,
      suplementos,
      refeicoes_por_dia,
      horario_acorda,
      horario_dorme,
      litros_agua,
      atividade_fisica,
      atividade_fisica_descricao,
      observacoes
    ) VALUES (
      ${data.nutricionista_id},
      ${data.nome},
      ${data.data_nascimento || null},
      ${data.sexo || null},
      ${data.whatsapp || null},
      ${data.email || null},
      ${data.peso_inicial != null && !isNaN(data.peso_inicial) ? data.peso_inicial : null},
      ${data.altura != null && !isNaN(data.altura) ? data.altura : null},
      ${data.objetivos && data.objetivos.length > 0 ? data.objetivos : null},
      ${data.objetivo_texto || null},
      ${data.nivel_atividade || null},
      ${data.patologias && data.patologias.length > 0 ? data.patologias : null},
      ${data.restricoes_alimentares && data.restricoes_alimentares.length > 0 ? data.restricoes_alimentares : null},
      ${data.alergias && data.alergias.length > 0 ? data.alergias : null},
      ${data.medicamentos || null},
      ${data.suplementos || null},
      ${data.refeicoes_por_dia != null && !isNaN(data.refeicoes_por_dia) ? data.refeicoes_por_dia : null},
      ${data.horario_acorda || null},
      ${data.horario_dorme || null},
      ${data.litros_agua != null && !isNaN(data.litros_agua) ? data.litros_agua : null},
      ${data.atividade_fisica != null ? data.atividade_fisica : null},
      ${data.atividade_fisica_descricao || null},
      ${data.observacoes || null}
    )
    RETURNING id;
  `;

  return res[0].id;
}
