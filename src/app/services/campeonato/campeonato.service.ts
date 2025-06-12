import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, query, where, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { ICampeonato } from '../../interfaces/icampeonato';
import { deleteDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CampeonatoService {

  private campeonatosCollection = collection(this.firestore, 'campeonatos');

  constructor(public firestore: Firestore) { }

  private async generateUniqueAccessCode(): Promise<string> {
    let code: string = ''; 
    let isUnique = false;
    while (!isUnique) {
      code = Math.floor(10000 + Math.random() * 90000).toString();
      const q = query(this.campeonatosCollection, where("codigoAcessoPublico", "==", code));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        isUnique = true;
      } else {
        console.warn(`Código de acesso ${code} já existe. Gerando outro...`);
      }
    }
    return code;
  }

  async addCampeonato(campeonatoData: { nome: string }, userId: string): Promise<string> {
    const publicAccessCode = await this.generateUniqueAccessCode();
    const docRef = await addDoc(this.campeonatosCollection, {
      nome: campeonatoData.nome,
      userId: userId,
      faseAtual: null,
      status: 'criado',
      campeaoId: null,
      campeaoNome: null,
      codigoAcessoPublico: publicAccessCode
    });
    console.log('Campeonato added with ID: ', docRef.id, ' and Public Access Code:', publicAccessCode);
    return docRef.id;
  }

  async getCampeonatos(userId: string): Promise<ICampeonato[]> {
    const q = query(this.campeonatosCollection, where("userId", "==", userId));
    const campeonatoSnapshot = await getDocs(q);
    const campeonatosList = campeonatoSnapshot.docs.map(doc => {
      const data = doc.data() as ICampeonato;
      return {
        id: doc.id,
        nome: data.nome,
        userId: data.userId,
        faseAtual: data.faseAtual || null,
        status: data.status || 'criado',
        campeaoId: data.campeaoId || null,
        campeaoNome: data.campeaoNome || null,
        codigoAcessoPublico: data.codigoAcessoPublico || null,
      } as ICampeonato;
    });
    return campeonatosList;
  }

  async updateCampeonato(campeonatoId: string, data: Partial<ICampeonato>): Promise<void> {
    const campeonatoDocRef = doc(this.firestore, 'campeonatos', campeonatoId);
    await updateDoc(campeonatoDocRef, data);
    console.log(`Campeonato ${campeonatoId} updated with data:`, data);
  }

  async deleteCampeonato(campeonatoId: string): Promise<void> {
    const campeonatoDocRef = doc(this.firestore, 'campeonatos', campeonatoId);
    await deleteDoc(campeonatoDocRef);
    console.log(`Campeonato ${campeonatoId} deleted`);
  }

  async getCampeonatoById(campeonatoId: string): Promise<ICampeonato | null> {
    const docRef = doc(this.firestore, 'campeonatos', campeonatoId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ICampeonato;
    } else {
      return null;
    }
  }

  async getCampeonatoByCodigoAcesso(codigo: string): Promise<ICampeonato | null> {
    const q = query(this.campeonatosCollection, where("codigoAcessoPublico", "==", codigo));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty && querySnapshot.docs.length > 0) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as ICampeonato;
    } else {
      return null;
    }
  }
}
