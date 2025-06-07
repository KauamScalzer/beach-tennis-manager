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
import { AddCampeonatoModalComponent } from '../add-campeonato-modal/add-campeonato-modal.component';

import { CampeonatoService } from '../services/campeonato/campeonato.service';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

addIcons({
  'search-outline': searchOutline,
  'add-outline': addOutline,
  'trophy-outline': trophyOutline,
  'people-outline': peopleOutline,
  'arrow-back-outline': arrowBackOutline,
});

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
  ],
  templateUrl: './campeonatos.page.html',
  styleUrls: ['./campeonatos.page.scss'],
})
export class CampeonatosPage implements OnInit {
  filtro = '';
  campeonatos: ICampeonato[] = [];
  currentUserUid: string | null = null;

  constructor(
    private modalController: ModalController,
    private campeonatoService: CampeonatoService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.authService.currentUser$.pipe(take(1)).subscribe(async user => {
      if (user) {
        this.currentUserUid = user.uid;
        await this.loadCampeonatos();
      } else {
        console.warn('Nenhum usuário logado. Redirecionando para login.');
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }

  async loadCampeonatos() {
    if (!this.currentUserUid) {
      console.warn('Não é possível carregar campeonatos: Usuário não logado.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Carregando campeonatos...',
    });
    await loading.present();

    try {
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

  // Novo método para retornar os nomes dos campeonatos filtrados
  getCampeonatoNomesFiltrados(): string[] {
    return this.campeonatos
      .filter(campeonato =>
        campeonato &&
        typeof campeonato.nome === 'string' &&
        campeonato.nome.toLowerCase().includes(this.filtro.toLowerCase())
      )
      .map(campeonato => campeonato.nome);
  }

  // Novo método para lidar com o clique no CardListComponent
  handleCampeonatoClick(nomeCampeonato: string) {
    const campeonatoSelecionado = this.campeonatos.find(c => c.nome === nomeCampeonato);
    if (campeonatoSelecionado) {
      this.abrirCampeonato(campeonatoSelecionado);
    } else {
      console.warn('Campeonato não encontrado para o nome:', nomeCampeonato);
      // Opcional: exibir um alerta ao usuário
    }
  }

  async adicionarCampeonato() {
    // ... (restante da lógica de adicionarCampeonato permanece a mesma)
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
    await this.loadCampeonatos();
  }

  abrirCampeonato(campeonato: ICampeonato) {
    console.log('Abrir detalhes do campeonato:', campeonato.nome, 'ID:', campeonato.id);
    this.router.navigate(['/times', campeonato.id]);
  }
}