import { Component } from '@angular/core';
import { IonicModule, LoadingController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  logoGoogle,
} from 'ionicons/icons';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

addIcons({
  'logo-google': logoGoogle,
});

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  constructor(
    private authService: AuthService, // Injete o AuthService
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  codigo = '';

  async signInWithGoogle() {
    const loading = await this.loadingController.create({
      message: 'Autenticando com Google...',
    });
    await loading.present();

    try {
      const result = await this.authService.signInWithGoogle(); // Chama o método do serviço

      console.log('Login com Google bem-sucedido:', result.user);
      this.router.navigateByUrl('/campeonatos', { replaceUrl: true });

    } catch (error: any) {
      console.error('Erro no login com Google:', error);

      let errorMessage = 'Ocorreu um erro ao tentar fazer login com o Google.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'O pop-up de login foi fechado antes da conclusão.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Uma solicitação de pop-up já está em andamento.';
      } else if (error.code === 'auth/auth-domain-config-required') {
        errorMessage = 'O domínio de autenticação não está configurado corretamente no Firebase.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'O método de login por Google não está habilitado no Firebase.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Já existe uma conta com o mesmo endereço de e-mail, mas com credenciais diferentes.';
      }

      const alert = await this.alertController.create({
        header: 'Erro de Login',
        message: errorMessage,
        buttons: ['OK'],
      });
      await alert.present();

    } finally {
      loading.dismiss();
    }
  }
}
