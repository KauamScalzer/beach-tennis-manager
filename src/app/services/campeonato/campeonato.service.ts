import { Injectable } from '@angular/core';
// Importe 'doc', 'updateDoc', 'getDoc'
import { Firestore, addDoc, collection, getDocs, query, where, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { ICampeonato } from '../../interfaces/icampeonato'; // Importe a interface atualizada
import { deleteDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CampeonatoService {

  private campeonatosCollection = collection(this.firestore, 'campeonatos');

  constructor(public firestore: Firestore) { }

  /**
   * Gera um código numérico de 5 dígitos e verifica sua unicidade no Firebase.
   * @returns Uma Promise que resolve com um código de acesso público único.
   */
  private async generateUniqueAccessCode(): Promise<string> {
    let code: string = ''; 
    let isUnique = false;
    while (!isUnique) {
      // Gera um número aleatório entre 10000 e 99999
      code = Math.floor(10000 + Math.random() * 90000).toString();
      // Verifica se o código já existe
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

  // Modificado: Agora aceita o userId como um parâmetro
  async addCampeonato(campeonatoData: { nome: string }, userId: string): Promise<string> {
    const publicAccessCode = await this.generateUniqueAccessCode(); // Gera o código único

    const docRef = await addDoc(this.campeonatosCollection, {
      nome: campeonatoData.nome,
      userId: userId,
      faseAtual: null, // Inicia sem fase atual
      status: 'criado', // Status inicial
      campeaoId: null, // Sem campeão
      campeaoNome: null, // Sem campeão
      codigoAcessoPublico: publicAccessCode // Salva o código de acesso público
    });
    console.log('Campeonato added with ID: ', docRef.id, ' and Public Access Code:', publicAccessCode);
    return docRef.id;
  }

  // Modificado: Agora aceita o userId e filtra os resultados
  async getCampeonatos(userId: string): Promise<ICampeonato[]> {
    const q = query(this.campeonatosCollection, where("userId", "==", userId));
    const campeonatoSnapshot = await getDocs(q);
    const campeonatosList = campeonatoSnapshot.docs.map(doc => {
      const data = doc.data() as ICampeonato;
      return {
        id: doc.id,
        nome: data.nome,
        userId: data.userId,
        faseAtual: data.faseAtual || null, // Garante que é null se não existir
        status: data.status || 'criado', // Garante um status padrão
        campeaoId: data.campeaoId || null,
        campeaoNome: data.campeaoNome || null,
        codigoAcessoPublico: data.codigoAcessoPublico || null,
      } as ICampeonato;
    });
    return campeonatosList;
  }

  // NOVO MÉTODO: Atualizar o status e a fase de um campeonato
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

  // NOVO MÉTODO: Obter um único campeonato pelo ID
  async getCampeonatoById(campeonatoId: string): Promise<ICampeonato | null> {
    const docRef = doc(this.firestore, 'campeonatos', campeonatoId);
    const docSnap = await getDoc(docRef); // CORREÇÃO: usar getDoc aqui
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ICampeonato;
    } else {
      return null;
    }
  }

  // NOVO MÉTODO: Obter um único campeonato pelo Código de Acesso Público
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