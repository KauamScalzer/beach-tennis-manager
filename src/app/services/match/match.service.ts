import { Injectable } from '@angular/core';
// Importações necessárias do Firebase Firestore
import { Firestore, addDoc, collection, getDocs, query, where, doc, updateDoc, CollectionReference, orderBy } from '@angular/fire/firestore';
import { IMatch } from '../../interfaces/imatch'; // Importe a interface IMatch que acabamos de criar

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  // Referência para a coleção 'matches' no Firestore
  private matchesCollection: CollectionReference;

  constructor(public firestore: Firestore) {
    // Inicializa a referência da coleção no construtor
    this.matchesCollection = collection(this.firestore, 'matches');
  }

  /**
   * Adiciona uma nova partida ao Firebase.
   * @param matchData Os dados da partida (objeto IMatch).
   * @returns Uma Promise que resolve com o ID do documento recém-criado no Firebase.
   */
  async addMatch(matchData: IMatch): Promise<string> {
    const docRef = await addDoc(this.matchesCollection, matchData);
    console.log('Partida adicionada com ID: ', docRef.id);
    return docRef.id;
  }

  /**
   * Retorna todas as partidas para um campeonato específico e UMA FASE específica.
   * @param campeonatoId O ID do campeonato.
   * @param fase O nome da fase (ex: 'Rodada 1', 'Quartas de Final').
   * @returns Uma Promise que resolve com um array de objetos IMatch, ordenados pela ordem da partida na fase.
   */
  async getMatchesByPhase(campeonatoId: string, fase: string): Promise<IMatch[]> {
    const q = query(
      this.matchesCollection,
      where("campeonatoId", "==", campeonatoId),
      where("fase", "==", fase),
      orderBy("partidaNaFase", "asc") // Ordena as partidas dentro da fase
    );
    const matchSnapshot = await getDocs(q);
    const matchesList = matchSnapshot.docs.map(doc => {
      // Retorna o ID do documento junto com os dados
      return {
        id: doc.id,
        ...doc.data()
      } as IMatch;
    });
    return matchesList;
  }

  /**
   * Retorna TODAS as partidas de um campeonato, para o histórico, ordenadas por fase e partida.
   * Este método será usado para a navegação de histórico na RodadaPage.
   * @param campeonatoId O ID do campeonato.
   * @returns Uma Promise que resolve com um array de objetos IMatch ordenados.
   */
  async getAllMatchesForChampionship(campeonatoId: string): Promise<IMatch[]> {
    const q = query(
      this.matchesCollection,
      where("campeonatoId", "==", campeonatoId),
      orderBy("ordemFase", "asc"), // Ordena primeiro pelas fases
      orderBy("partidaNaFase", "asc") // Depois pela ordem da partida dentro da fase
    );
    const matchSnapshot = await getDocs(q);
    const matchesList = matchSnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as IMatch;
    });
    return matchesList;
  }

  /**
   * Atualiza uma partida existente no Firebase.
   * @param matchId O ID da partida a ser atualizada.
   * @param data Os dados a serem atualizados (pode ser um objeto parcial com apenas os campos que mudaram).
   * @returns Uma Promise vazia que resolve quando a atualização é concluída.
   */
  async updateMatch(matchId: string, data: Partial<IMatch>): Promise<void> {
    const matchDocRef = doc(this.firestore, 'matches', matchId);
    await updateDoc(matchDocRef, data);
    console.log(`Partida ${matchId} atualizada.`);
  }

  /**
   * Verifica se todas as partidas de uma fase específica têm um vencedor definido.
   * @param campeonatoId O ID do campeonato.
   * @param fase O nome da fase a ser verificada.
   * @returns Uma Promise que resolve para 'true' se todas as partidas têm vencedor, 'false' caso contrário.
   */
  async areAllMatchesFinishedInPhase(campeonatoId: string, fase: string): Promise<boolean> {
    const matches = await this.getMatchesByPhase(campeonatoId, fase);
    // Usa o método 'every' para verificar se a condição é verdadeira para TODOS os elementos
    return matches.every(match => match.vencedorId !== null);
  }

  // Você pode adicionar outros métodos aqui no futuro, como deletar partidas, etc.
}