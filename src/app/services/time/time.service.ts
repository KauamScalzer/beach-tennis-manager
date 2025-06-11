import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, query, where, CollectionReference, doc, updateDoc } from '@angular/fire/firestore';
import { deleteDoc } from 'firebase/firestore';

interface ITime {
  id: string;
  nome: string;
  campeonatoId: string; // Adicionado: ID do campeonato ao qual o time pertence
}

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  constructor(public firestore: Firestore) { }

  /**
   * Adiciona um novo time a um campeonato específico.
   * @param timeData Objeto com os dados do time (ex: { nome: 'Time A' }).
   * @param campeonatoId O ID do campeonato ao qual este time pertence.
   * @returns O ID do documento recém-criado no Firebase.
   */
  async addTime(timeData: { nome: string }, campeonatoId: string): Promise<string> {
    // Referência à coleção 'times' dentro do documento do campeonato.
    // Ou, para uma coleção raiz 'times' com um campo 'campeonatoId':
    const timesCollection: CollectionReference = collection(this.firestore, 'times');

    const docRef = await addDoc(timesCollection, {
      nome: timeData.nome,
      campeonatoId: campeonatoId // Salva o ID do campeonato junto com o time
    });
    console.log('Time added with ID: ', docRef.id);
    return docRef.id;
  }

  /**
   * Retorna a lista de times para um campeonato específico.
   * @param campeonatoId O ID do campeonato.
   * @returns Um array de objetos ITime.
   */
  async getTimes(campeonatoId: string): Promise<ITime[]> {
    const timesCollection: CollectionReference = collection(this.firestore, 'times');
    // Cria uma consulta para buscar apenas documentos onde 'campeonatoId' é igual ao campeonatoId fornecido
    const q = query(timesCollection, where("campeonatoId", "==", campeonatoId));

    const timeSnapshot = await getDocs(q);
    const timesList = timeSnapshot.docs.map(doc => {
      const data = doc.data() as { nome: string; campeonatoId: string };
      return {
        id: doc.id,
        nome: data.nome,
        campeonatoId: data.campeonatoId
      } as ITime;
    });
    return timesList;
  }

  async updateTime(timeId: string, timeData: { nome: string }): Promise<void> {
    const timeDoc = doc(this.firestore, 'times', timeId);
    await updateDoc(timeDoc, {
      nome: timeData.nome
    });
    console.log('Time updated with ID: ', timeId);
  }

  async deleteTime(timeId: string): Promise<void> {
    const timeDoc = doc(this.firestore, 'times', timeId);
    await deleteDoc(timeDoc);
    console.log('Time deleted with ID: ', timeId);
  }
}