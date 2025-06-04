import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, UserCredential, signOut, user } from '@angular/fire/auth'; // Importe 'user' para observar o estado de autenticação
import { Observable } from 'rxjs'; // Importe Observable

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Observable para o estado de autenticação do usuário
  currentUser$: Observable<any> = user(this.auth);

  constructor(private auth: Auth) { }

  /**
   * Realiza o login com o Google usando um pop-up.
   * @returns Uma Promise que resolve com o UserCredential em caso de sucesso.
   */
  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  /**
   * Realiza o logout do usuário.
   * @returns Uma Promise que resolve quando o logout é concluído.
   */
  async signOut(): Promise<void> {
    return signOut(this.auth);
  }

  // Você pode adicionar outros métodos de autenticação aqui, como login por email/senha
  // async signInWithEmailPassword(email: string, password: string): Promise<UserCredential> {
  //   return signInWithEmailAndPassword(this.auth, email, password);
  // }
}