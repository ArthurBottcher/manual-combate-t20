import { Scenario } from './types';

export const INITIAL_SCENARIOS: Scenario[] = [
  { id: 'acao-padrao', name: 'Ação Padrão', skills: [] },
  { id: 'acao-movimento', name: 'Ação de Movimento', skills: [] },
  { id: 'acao-completa', name: 'Ação Completa', skills: [] },
  { id: 'acao-livre', name: 'Ação Livre', skills: [] },
  { id: 'reacao', name: 'Reação', skills: [] },
  { id: 'inicio-turno', name: 'Início do Turno', skills: [] },
  { id: 'fim-turno', name: 'Fim do Turno', skills: [] },
];
