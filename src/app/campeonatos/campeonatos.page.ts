import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  addOutline,
  trophyOutline,
  peopleOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { HeaderComponent } from '../header/header.component';
import { CardListComponent } from '../card-list/card-list.component';
import { AddCampeonatoModalComponent } from '../add-campeonato-modal/add-campeonato-modal.component'; // Ajuste o caminho

import { CampeonatoService } from '../services/campeonato/campeonato.service';
import { AuthService } from '../services/auth/auth.service'; // Importe o AuthService
import { Router } from '@angular/router'; // Importe Router para redirecionamento
import { take } from 'rxjs/operators'; // Importe 'take' do 'rxjs/operators'

addIcons({
  'search-outline': searchOutline,
  'add-outline': addOutline,
  'trophy-outline': trophyOutline,
  'people-outline': peopleOutline,
  'arrow-back-outline': arrowBackOutline,
});

// A interface agora inclui o userId
interface ICampeonato {
  id: string;
  nome: string;
  userId: string;
}

@Component({
  selector: 'app-campeonatos',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderComponent,
    CardListComponent,
    // AddCampeonatoModalComponent não precisa ser importado aqui se for usado apenas via ModalController
  ],
  templateUrl: './campeonatos.page.html',
  styleUrls: ['./campeonatos.page.scss'],
})
export class CampeonatosPage implements OnInit {
  filtro = '';
  campeonatos: ICampeonato[] = [];
  currentUserUid: string | null = null; // Para armazenar o ID do usuário logado

  constructor(
    private modalController: ModalController,
    private campeonatoService: CampeonatoService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private authService: AuthService, // Injete o AuthService
    private router: Router // Injete o Router
  ) {}

  async ngOnInit() {
    // Escuta o estado do usuário. take(1) para pegar o valor atual e desinscrever
    this.authService.currentUser$.pipe(take(1)).subscribe(async user => {
      if (user) {
        this.currentUserUid = user.uid; // Armazena o UID do usuário
        await this.loadCampeonatos(); // Carrega os campeonatos desse usuário
      } else {
        // Se não houver usuário logado, redireciona para a página de login
        console.warn('Nenhum usuário logado. Redirecionando para login.');
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }

  async loadCampeonatos() {
    if (!this.currentUserUid) {
      console.warn('Não é possível carregar campeonatos: Usuário não logado.');
      // Opcional: exiba um alerta ou redirecione novamente
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Carregando campeonatos...',
    });
    await loading.present();

    try {
      // Passa o UID do usuário para o serviço
      this.campeonatos = await this.campeonatoService.getCampeonatos(this.currentUserUid);
      console.log('Campeonatos carregados para o usuário', this.currentUserUid, ':', this.campeonatos);
    } catch (error) {
      console.error('Erro ao carregar campeonatos:', error);
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível carregar os campeonatos.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      loading.dismiss();
    }
  }

  campeonatosFiltrados(): string[] {
    // Filtra e mapeia como antes, mas agora sobre 'this.campeonatos' que contém o userId
    return this.campeonatos
      .filter((campeonato) => {
        return (
          campeonato &&
          typeof campeonato.nome === 'string' &&
          campeonato.nome.toLowerCase().includes(this.filtro.toLowerCase())
        );
      })
      .map((campeonato) => campeonato.nome);
  }

  async adicionarCampeonato() {
    if (!this.currentUserUid) {
      console.error('Não é possível adicionar campeonato: Usuário não logado.');
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Você precisa estar logado para criar um campeonato.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const modal = await this.modalController.create({
      component: AddCampeonatoModalComponent,
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role === 'confirm' && data && data.nome) {
      const loading = await this.loadingCtrl.create({
        message: 'Salvando campeonato...',
      });
      await loading.present();

      try {
        // Passa os dados do campeonato E o UID do usuário
        const id = await this.campeonatoService.addCampeonato(data, this.currentUserUid);
        console.log('Campeonato salvo no Firebase com ID:', id);

        const alert = await this.alertCtrl.create({
          header: 'Sucesso!',
          message: 'Campeonato criado com sucesso!',
          buttons: ['OK'],
        });
        await alert.present();

      } catch (error) {
        console.error('Erro ao salvar campeonato no Firebase:', error);
        const alert = await this.alertCtrl.create({
          header: 'Erro',
          message: 'Não foi possível salvar o campeonato. Tente novamente.',
          buttons: ['OK'],
        });
        await alert.present();
      } finally {
        loading.dismiss();
      }
    } else {
      console.log('Criação de campeonato cancelada ou sem dados válidos.');
    }
    // Recarrega os campeonatos do Firebase para atualizar a lista
    await this.loadCampeonatos();
  }

  abrirCampeonato(nome: string) {
    console.log('Abrir detalhes do campeonato:', nome);
    // Se você precisar do ID para navegar para a página de detalhes,
    // precisará encontrar o campeonato pelo nome ou ajustar o CardListComponent
    // para emitir o objeto ICampeonato completo.
  }
}