export interface ICampeonato {
  id: string;
  nome: string;
  userId: string;
  faseAtual?: string | null;
  status?: 'criado' | 'em_andamento' | 'finalizado';
  campeaoId?: string | null;
  campeaoNome?: string | null;
  codigoAcessoPublico?: string | null;
}
