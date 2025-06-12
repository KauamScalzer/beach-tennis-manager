import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, UserCredential, signOut, user } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser$: Observable<any> = user(this.auth);

  constructor(private auth: Auth) { }

  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async signOut(): Promise<void> {
    return signOut(this.auth);
  }
}
