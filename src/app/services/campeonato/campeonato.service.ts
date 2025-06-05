import { Injectable } from '@angular/core';
// Importe 'query' e 'where' para as consultas filtradas
import { Firestore, addDoc, collection, getDocs, query, where } from '@angular/fire/firestore';

// A interface agora inclui o userId
interface ICampeonato {
  id: string;
  nome: string;
  userId: string; // Adicionado: ID do usuário proprietário do campeonato
}

@Injectable({
  providedIn: 'root'
})
export class CampeonatoService {

  constructor(public firestore: Firestore) { }

  // Modificado: Agora aceita o userId como um parâmetro
  async addCampeonato(campeonatoData: { nome: string }, userId: string): Promise<string> {
    const docRef = await addDoc(collection(this.firestore, "campeonatos"), {
      nome: campeonatoData.nome,
      userId: userId // Salva o ID do usuário junto com o campeonato
    });
    console.log('Campeonato added with ID: ', docRef.id);
    return docRef.id;
  }

  // Modificado: Agora aceita o userId e filtra os resultados
  async getCampeonatos(userId: string): Promise<ICampeonato[]> {
    const campeonatosColRef = collection(this.firestore, 'campeonatos');
    // Cria uma consulta para buscar apenas documentos onde 'userId' é igual ao userId fornecido
    const q = query(campeonatosColRef, where("userId", "==", userId));

    const campeonatoSnapshot = await getDocs(q); // Executa a consulta
    const campeonatosList = campeonatoSnapshot.docs.map(doc => {
      const data = doc.data() as { nome: string; userId: string }; // Assegura os tipos
      return {
        id: doc.id,
        nome: data.nome,
        userId: data.userId // Inclui o userId na interface
      } as ICampeonato;
    });
    return campeonatosList;
  }
}