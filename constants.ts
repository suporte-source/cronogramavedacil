import { Project } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Mind',
    category: 'Mind',
    progress: 75,
    status: 'NO_PRAZO',
    criateDays: 12,
    clientDays: 2,
    originalDeadline: '2024-06-15',
    tasks: [
      { id: 't1', name: 'Levantamento de Requisitos', responsible: 'Criate', responsibleName: 'Ana (Criate)', status: 'COMPLETED', startDate: '2024-05-01', durationDays: 5 },
      { id: 't2', name: 'Desenvolvimento do Modelo', responsible: 'Criate', responsibleName: 'Carlos (Criate)', status: 'COMPLETED', startDate: '2024-05-06', durationDays: 10 },
      { id: 't3', name: 'Validação de Dados', responsible: 'Vedacil', responsibleName: 'Roberto (Vedacil)', status: 'IN_PROGRESS', startDate: '2024-05-20', durationDays: 3 },
      { id: 't4', name: 'Deploy em Homologação', responsible: 'Criate', responsibleName: 'Ana (Criate)', status: 'PENDING', startDate: '2024-05-24', durationDays: 2 },
    ]
  },
  {
    id: '2',
    name: 'Gestor Comercial',
    category: 'Gestor',
    progress: 45,
    status: 'AGUARDANDO_CLIENTE',
    criateDays: 8,
    clientDays: 15, // High client delay
    originalDeadline: '2024-07-01',
    tasks: [
      { id: 't1', name: 'Integração API', responsible: 'Criate', responsibleName: 'Dev Team', status: 'COMPLETED', startDate: '2024-05-10', durationDays: 8 },
      { id: 't2', name: 'Aprovação de Layout', responsible: 'Vedacil', responsibleName: 'Fernanda (Mkt)', status: 'IN_PROGRESS', startDate: '2024-05-20', durationDays: 5 },
      { id: 't3', name: 'Treinamento IA', responsible: 'Criate', responsibleName: 'Data Team', status: 'PENDING', startDate: '2024-06-01', durationDays: 10 },
    ]
  },
  {
    id: '3',
    name: 'Atendimento Cobrança',
    category: 'Cobrança',
    progress: 90,
    status: 'NO_PRAZO',
    criateDays: 20,
    clientDays: 1,
    originalDeadline: '2024-05-30',
    tasks: [
      { id: 't1', name: 'Fluxo de Régua', responsible: 'Criate', responsibleName: 'Pedro (Criate)', status: 'COMPLETED', startDate: '2024-04-15', durationDays: 15 },
      { id: 't2', name: 'Testes de Envio', responsible: 'Criate', responsibleName: 'Pedro (Criate)', status: 'IN_PROGRESS', startDate: '2024-05-10', durationDays: 5 },
      { id: 't3', name: 'Go-Live', responsible: 'Criate', responsibleName: 'Pedro (Criate)', status: 'PENDING', startDate: '2024-05-20', durationDays: 1 },
    ]
  },
  {
    id: '4',
    name: 'Souza (Atendimento Comercial)',
    category: 'Comercial',
    progress: 10,
    status: 'IMPEDIDO',
    criateDays: 2,
    clientDays: 10,
    originalDeadline: '2024-08-15',
    tasks: [
      { id: 't1', name: 'Acesso ao CRM', responsible: 'Vedacil', responsibleName: 'TI (Vedacil)', status: 'IN_PROGRESS', startDate: '2024-05-15', durationDays: 2 },
      { id: 't2', name: 'Desenvolvimento Fluxo', responsible: 'Criate', responsibleName: 'Lucas (Criate)', status: 'PENDING', startDate: '2024-05-20', durationDays: 15 },
    ]
  },
];