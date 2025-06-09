export interface ICampeonato {
  id: string;
  nome: string;
  userId: string; // ID do usuário que criou o campeonato

  // --- NOVOS CAMPOS ---
  faseAtual?: string | null; // Nome da fase que está em andamento (ex: 'Rodada 1', 'Quartas de Final')
  status?: 'criado' | 'em_andamento' | 'finalizado'; // Estado do campeonato
  campeaoId?: string | null; // ID do time campeão (se houver)
  campeaoNome?: string | null; // Nome do time campeão (se houver)
  codigoAcessoPublico?: string | null; // Código amigável de 5 dígitos para acesso público

  // Você pode ter outros campos aqui, se já existirem
  // dataCriacao?: Date;
  // tipoEsporte?: string;
}