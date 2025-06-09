export interface IMatch {
  id?: string; // Opcional, será o ID gerado pelo Firebase para cada documento de partida
  campeonatoId: string; // ID do campeonato a que esta partida pertence

  fase: string; // Nome da fase (ex: 'Rodada 1', 'Quartas de Final', 'Semifinal', 'Final')
  ordemFase: number; // Ordem numérica da fase (ex: 1 para Rodada 1, 2 para Quartas, etc. - facilita a navegação e ordenação)
  partidaNaFase: number; // Número da partida dentro daquela fase (ex: 1ª, 2ª partida - facilita a ordenação e exibição)

  timeAId: string; // ID do primeiro time envolvido na partida
  timeANome: string; // Nome do primeiro time

  timeBId: string | null; // ID do segundo time. Pode ser null se for um "BYE" (time que avança sem jogar)
  timeBNome: string | null; // Nome do segundo time. Pode ser null para "BYE"

  vencedorId: string | null; // ID do time que venceu a partida (será null até a partida ser jogada)
  vencedorNome: string | null; // Nome do time vencedor (será null até a partida ser jogada)

  placarTimeA: number; // Placar atual do Time A na partida
  placarTimeB: number; // Placar atual do Time B na partida

  // Você pode adicionar outros campos aqui no futuro, como data/hora do jogo, local, etc.
}