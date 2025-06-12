import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, query, where, doc, updateDoc, CollectionReference, orderBy } from '@angular/fire/firestore';
import { IMatch } from '../../interfaces/imatch';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private matchesCollection: CollectionReference;

  constructor(public firestore: Firestore) {
    this.matchesCollection = collection(this.firestore, 'matches');
  }

  async addMatch(matchData: IMatch): Promise<string> {
    const docRef = await addDoc(this.matchesCollection, matchData);
    console.log('Partida adicionada com ID: ', docRef.id);
    return docRef.id;
  }

  async getMatchesByPhase(campeonatoId: string, fase: string): Promise<IMatch[]> {
    const q = query(
      this.matchesCollection,
      where("campeonatoId", "==", campeonatoId),
      where("fase", "==", fase),
      orderBy("partidaNaFase", "asc")
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

  async getAllMatchesForChampionship(campeonatoId: string): Promise<IMatch[]> {
    const q = query(
      this.matchesCollection,
      where("campeonatoId", "==", campeonatoId),
      orderBy("ordemFase", "asc"),
      orderBy("partidaNaFase", "asc")
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

  async updateMatch(matchId: string, data: Partial<IMatch>): Promise<void> {
    const matchDocRef = doc(this.firestore, 'matches', matchId);
    await updateDoc(matchDocRef, data);
    console.log(`Partida ${matchId} atualizada.`);
  }

  async areAllMatchesFinishedInPhase(campeonatoId: string, fase: string): Promise<boolean> {
    const matches = await this.getMatchesByPhase(campeonatoId, fase);
    return matches.every(match => match.vencedorId !== null);
  }
}
