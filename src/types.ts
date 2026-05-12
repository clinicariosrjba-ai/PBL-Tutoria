export interface FalaPendente {
  id: string;
  nome: string;
}

export type Screen = 'cadastro' | 'gerenciador';

export interface AppState {
  alunos: string[];
  objetivos: string[];
}
