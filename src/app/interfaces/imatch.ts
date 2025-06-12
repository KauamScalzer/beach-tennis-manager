export interface IMatch {
  id?: string;
  campeonatoId: string;
  fase: string;
  ordemFase: number;
  partidaNaFase: number;
  timeAId: string;
  timeANome: string;
  timeBId: string | null;
  timeBNome: string | null;
  vencedorId: string | null;
  vencedorNome: string | null;
  placarTimeA: number;
  placarTimeB: number;
}
