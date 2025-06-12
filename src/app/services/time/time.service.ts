import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, query, where, CollectionReference, doc, updateDoc } from '@angular/fire/firestore';
import { deleteDoc } from 'firebase/firestore';

interface ITime {
  id: string;
  nome: string;
  campeonatoId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  constructor(public firestore: Firestore) { }

  async addTime(timeData: { nome: string }, campeonatoId: string): Promise<string> {
    const timesCollection: CollectionReference = collection(this.firestore, 'times');
    const docRef = await addDoc(timesCollection, {
      nome: timeData.nome,
      campeonatoId: campeonatoId
    });
    console.log('Time added with ID: ', docRef.id);
    return docRef.id;
  }

  async getTimes(campeonatoId: string): Promise<ITime[]> {
    const timesCollection: CollectionReference = collection(this.firestore, 'times');
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
