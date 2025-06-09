import { Component } from '@angular/core';
import { IonicModule, LoadingController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  logoGoogle,
  eyeOutline, // 🔥 Importe este ícone para o botão de visualização
} from 'ionicons/icons';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { CampeonatoService } from '../services/campeonato/campeonato.service'; // 🔥 Importe o CampeonatoService

addIcons({
  'logo-google': logoGoogle,
  'eye-outline': eyeOutline, // 🔥 Adicione este ícone
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
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private campeonatoService: CampeonatoService, // 🔥 Injete o CampeonatoService
  ) {}

  codigo = ''; // Corresponde ao ngModel do input

  async signInWithGoogle() {
    const loading = await this.loadingController.create({
      message: 'Autenticando com Google...',
    });
    await loading.present();

    try {
      const result = await this.authService.signInWithGoogle();

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

  // 🔥 NOVO MÉTODO: Acessar campeonato pelo código público
  async viewCampeonatoByCode() {
    const trimmedCodigo = this.codigo.trim(); // Remove espaços em branco
    if (!trimmedCodigo) {
      const alert = await this.alertController.create({
        header: 'Atenção',
        message: 'Por favor, digite o código do campeonato.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Buscando campeonato...',
    });
    await loading.present();

    try {
      // Busca o campeonato usando o código de acesso público
      const campeonato = await this.campeonatoService.getCampeonatoByCodigoAcesso(trimmedCodigo);

      if (campeonato && campeonato.faseAtual) { // Verifica se o campeonato existe e já tem uma fase iniciada
        console.log('Campeonato encontrado pelo código:', campeonato);
        // Redireciona para a rota pública da RodadaPage
        this.router.navigate(['/publico', trimmedCodigo]);
      } else if (campeonato && !campeonato.faseAtual) {
        const alert = await this.alertController.create({
          header: 'Campeonato Não Iniciado',
          message: 'Este campeonato ainda não foi iniciado pelo seu organizador.',
          buttons: ['OK'],
        });
        await alert.present();
      }
      else {
        const alert = await this.alertController.create({
          header: 'Erro',
          message: 'Código de campeonato inválido ou não encontrado.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    } catch (error) {
      console.error('Erro ao buscar campeonato pelo código:', error);
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'Não foi possível buscar o campeonato. Tente novamente.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      loading.dismiss();
    }
  }
}