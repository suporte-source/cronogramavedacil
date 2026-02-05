import { Project, Task, ProjectStatus } from '../types';
import { INITIAL_PROJECTS } from '../constants';

// =============================================================================================
// ⚠️ CONFIGURAÇÃO DA PLANILHA (Obrigatório)
// 1. Crie uma planilha com as abas "Projetos" e "Tarefas".
// 2. Vá em Compartilhar > Qualquer pessoa com o link > Leitor.
// 3. Copie o ID da URL (a parte estranha entre /d/ e /edit) e cole abaixo.
// =============================================================================================

const SPREADSHEET_ID = '1jb0dtmsMpnbzhMOFTx-Y8c8EL_vUQpRBDYkrPX_CtqE'; // <--- COLE SEU ID AQUI

/*
  ESTRUTURA ESPERADA (Colunas):
  
  Aba 'Projetos':
  A: ID (ex: 1)
  B: Nome do Projeto (ex: Mind IA)
  C: Categoria (Mind, Gestor, Cobrança, Comercial)
  D: Progresso (0-100) -> AGORA É CALCULADO AUTOMATICAMENTE
  E: Status (NO_PRAZO, AGUARDANDO_CLIENTE, IMPEDIDO)
  F: Dias Criate (número)
  G: Dias Cliente (número)
  H: Prazo Original (AAAA-MM-DD)

  Aba 'Tarefas':
  A: ID Tarefa (ex: t1)
  B: ID Projeto (ex: 1)
  C: Nome da Tarefa
  D: Responsável (Criate ou Vedacil)
  E: Nome Responsável (ex: Ana)
  F: Status (Concluído, Em Andamento, Pendente)
  G: Data Início (AAAA-MM-DD)
  H: Duração (dias) - Manual (Estimativa)
  I: Data Conclusão (AAAA-MM-DD) - Real (Opcional)
*/

interface FetchResult {
  data: Project[];
  isOffline: boolean;
  error?: string;
}

// Helper to parse GViz response
const fetchGvizData = async (sheetName: string) => {
  // SQL-like query to get data. 'tqx=out:json' requests JSON format.
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
         throw new Error(`Planilha não encontrada. Verifique se o ID '${SPREADSHEET_ID}' está correto.`);
    }
    throw new Error(`Erro HTTP: ${response.status}`);
  }
  
  const text = await response.text();
  // GViz returns JSON wrapped in a function call: google.visualization.Query.setResponse({...});
  // We use Regex to extract the JSON object inside the parentheses.
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S\w]+)\);/);
  
  if (!jsonMatch || !jsonMatch[1]) {
    throw new Error(`Erro ao interpretar dados da aba ${sheetName}. Verifique se a planilha está pública.`);
  }

  const json = JSON.parse(jsonMatch[1]);
  
  if (json.status === 'error') {
     throw new Error(`Erro na planilha (${sheetName}): ${json.errors[0]?.detailed_message || json.errors[0]?.message}`);
  }

  // json.table.rows contains the data objects
  return json.table.rows;
};

// Helper to safely get value from GViz cell
const getVal = (row: any, index: number, defaultValue: any = '') => {
  return (row.c && row.c[index]) ? (row.c[index].v ?? defaultValue) : defaultValue;
};

// ROBUST DATE PARSER
// Google Visualization API returns "Date(2024, 5, 20)" for date cells, or just a string "2024-05-20" for text cells.
const parseGvizDate = (value: any): string => {
  if (!value) return '';

  const strValue = String(value);

  // Handle GViz "Date(yyyy, m, d)" format (Month is 0-indexed)
  if (strValue.startsWith('Date(')) {
    const parts = strValue.match(/\d+/g);
    if (parts && parts.length >= 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]); // 0 = Jan, 1 = Feb
      const day = parseInt(parts[2]);
      const date = new Date(year, month, day);
      return date.toISOString();
    }
  }

  // Handle common string formats
  // Attempt to create a date directly
  const date = new Date(strValue);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }

  return '';
};

// Helper to normalize Project status
const normalizeProjectStatus = (raw: string): ProjectStatus => {
  const upper = String(raw).toUpperCase().trim();
  
  if (upper.includes('IMPEDIDO') || upper.includes('ATRASADO')) return 'IMPEDIDO';
  if (upper.includes('AGUARDANDO') || upper.includes('CLIENTE')) return 'AGUARDANDO_CLIENTE';
  if (upper.includes('PRAZO') || upper === 'OK' || upper === 'NO_PRAZO') return 'NO_PRAZO';
  
  // Default fallback
  return 'NO_PRAZO';
};

// Helper to normalize Task status (Handles Portuguese inputs)
const normalizeTaskStatus = (raw: string): 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' => {
  const upper = String(raw).toUpperCase().trim();
  
  if (upper === 'CONCLUÍDO' || upper === 'CONCLUIDO' || upper === 'COMPLETED' || upper === 'DONE' || upper === 'OK' || upper === 'FINALIZADO') return 'COMPLETED';
  if (upper === 'EM ANDAMENTO' || upper === 'IN_PROGRESS' || upper === 'DOING' || upper === 'EXECUTANDO' || upper === 'ANDAMENTO') return 'IN_PROGRESS';
  
  return 'PENDING';
};

export const fetchDashboardData = async (): Promise<FetchResult> => {
  try {
    // 1. Fetch Projects Data
    const projectsRows = await fetchGvizData('Projetos');
    
    // 2. Fetch Tasks Data
    const tasksRows = await fetchGvizData('Tarefas');

    if (!projectsRows.length) {
        throw new Error("A aba 'Projetos' parece estar vazia.");
    }

    // 3. Parse Tasks
    const parsedTasks: (Task & { projectId: string })[] = tasksRows.map((row: any) => {
      const startDateStr = parseGvizDate(getVal(row, 6, ''));
      const endDateStr = parseGvizDate(getVal(row, 8, '')); // Column I
      const rawStatus = String(getVal(row, 5, 'PENDING'));
      
      // Default duration from Column H (Manual Estimate)
      let durationDays = Number(getVal(row, 7, 0));

      // SMART BI LOGIC: Calculate real duration if dates exist
      if (startDateStr && endDateStr) {
          const start = new Date(startDateStr);
          const end = new Date(endDateStr);
          
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
             const diffTime = end.getTime() - start.getTime();
             const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             if (calculatedDays >= 0) {
                 durationDays = Math.max(1, calculatedDays);
             }
          }
      }

      return {
        id: String(getVal(row, 0, `t-${Math.random()}`)),
        projectId: String(getVal(row, 1, '')),
        name: String(getVal(row, 2, 'Tarefa sem nome')),
        responsible: (getVal(row, 3, 'Criate') as 'Criate' | 'Vedacil'),
        responsibleName: String(getVal(row, 4, '')),
        status: normalizeTaskStatus(rawStatus),
        startDate: startDateStr,
        durationDays: durationDays,
        endDate: endDateStr
      };
    });

    // 4. Parse Projects
    const parsedProjects: Project[] = projectsRows.map((row: any) => {
      const projectId = String(getVal(row, 0, ''));
      
      // Skip empty rows if any
      if (!projectId) return null;

      const projectTasks = parsedTasks
        .filter(t => t.projectId === projectId)
        .map(({ projectId, ...task }) => task);

      const rawStatus = String(getVal(row, 4, 'NO_PRAZO'));

      // AUTO-CALCULATE PROGRESS from tasks
      let finalProgress = 0;
      const totalTasks = projectTasks.length;
      
      if (totalTasks > 0) {
        const completedTasks = projectTasks.filter(t => t.status === 'COMPLETED').length;
        finalProgress = Math.round((completedTasks / totalTasks) * 100);
      } else {
        // Fallback to manual column D if no tasks exist
        let rawProgress = Number(getVal(row, 3, 0));
        if (rawProgress <= 1 && rawProgress > 0) {
            rawProgress = rawProgress * 100;
        }
        finalProgress = Math.round(rawProgress);
      }

      const deadlineVal = getVal(row, 7, '');
      const parsedDeadline = parseGvizDate(deadlineVal);

      return {
        id: projectId,
        name: String(getVal(row, 1, 'Novo Projeto')),
        category: (getVal(row, 2, 'Mind') as any),
        progress: finalProgress,
        status: normalizeProjectStatus(rawStatus),
        criateDays: Number(getVal(row, 5, 0)),
        clientDays: Number(getVal(row, 6, 0)),
        originalDeadline: parsedDeadline || new Date().toISOString(),
        tasks: projectTasks
      };
    }).filter(p => p !== null) as Project[];

    return { data: parsedProjects, isOffline: false };

  } catch (error: any) {
    console.error("Failed to fetch from Google Sheets (GViz)", error);
    
    // Check for specific GViz errors
    let userMessage = error.message;
    if (userMessage.includes('Erro ao interpretar')) {
        userMessage = "Não foi possível ler as abas 'Projetos' ou 'Tarefas'. Verifique se os nomes estão exatos na planilha e se ela está PÚBLICA.";
    }

    return { 
        data: INITIAL_PROJECTS, 
        isOffline: true, 
        error: userMessage
    };
  }
};