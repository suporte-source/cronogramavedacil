export type ProjectStatus = 'NO_PRAZO' | 'AGUARDANDO_CLIENTE' | 'IMPEDIDO';

export interface Task {
  id: string;
  name: string;
  responsible: 'Criate' | 'Vedacil';
  responsibleName: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  startDate: string;
  durationDays: number;
  endDate?: string; // Actual completion date (optional)
}

export interface Project {
  id: string;
  name: string;
  category: 'Mind' | 'Gestor' | 'Cobrança' | 'Comercial';
  progress: number;
  status: ProjectStatus;
  criateDays: number;
  clientDays: number; // Accumulated delay/wait time
  originalDeadline: string;
  tasks: Task[];
}

export interface ProjectData extends Project {
  projectedDeadline: string;
}

// Types for raw data coming from Google Sheets
export interface SheetProjectRow {
  id: string;
  name: string;
  category: string;
  progress: string;
  status: string;
  criateDays: string;
  clientDays: string;
  originalDeadline: string;
}

export interface SheetTaskRow {
  id: string;
  projectId: string;
  name: string;
  responsible: string;
  responsibleName: string;
  status: string;
  startDate: string;
  durationDays: string;
  endDate?: string;
}