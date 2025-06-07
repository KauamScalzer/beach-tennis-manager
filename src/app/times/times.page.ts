import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router'; // Importe ActivatedRoute
import { addIcons } from 'ionicons';
import { addOutline, play, arrowBackOutline } from 'ionicons/icons'; // Importe arrowBackOutline
import { HeaderComponent } from '../header/header.component';
import { CardListComponent } from '../card-list/card-list.component';
import { AddTimeModalComponent } from '../add-time-modal/add-time-modal.component';

import { TimeService } from '../services/time/time.service'; // Importe o TimeService

addIcons({
  'add-outline': addOutline,
  'play': play,
  'arrow-back-outline': arrowBackOutline, // Adicione o ícone
});

interface ITime {
  id: string;
  nome: string;
  campeonatoId: string;
}

// ... (imports existentes)

@Component({
  selector: 'app-times',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    HeaderComponent,
    CardListComponent,
  ],
  templateUrl: './times.page.html',
  styleUrls: ['./times.page.scss'],
})
export class TimesPage implements OnInit {
  equipes: ITime[] = [];
  campeonatoId: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private activatedRoute: ActivatedRoute,
    private timeService: TimeService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async params => {
      this.campeonatoId = params.get('campeonatoId');
      if (this.campeonatoId) {
        console.log('ID do Campeonato:', this.campeonatoId);
        await this.loadTimes();
      } else {
        console.warn('Nenhum ID de campeonato fornecido na rota.');
      }
    });
  }

  async loadTimes() {
    if (!this.campeonatoId) {
      console.warn('Não é possível carregar times: Campeonato ID não definido.');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Carregando equipes...',
    });
    await loading.present();

    try {
      this.equipes = await this.timeService.getTimes(this.campeonatoId);
      console.log('Equipes carregadas para o campeonato', this.campeonatoId, ':', this.equipes);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível carregar as equipes.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      loading.dismiss();
    }
  }

  // Novo método para retornar os nomes das equipes
  getEquipeNomes(): string[] {
    return this.equipes.map(e => e.nome);
  }

  async adicionarEquipe() {
    // ... (restante da lógica de adicionarEquipe permanece a mesma)
    if (!this.campeonatoId) {
        console.error('Não é possível adicionar equipe: Campeonato ID não definido.');
        const alert = await this.alertCtrl.create({
            header: 'Erro',
            message: 'Não foi possível determinar o campeonato para adicionar a equipe.',
            buttons: ['OK'],
        });
        await alert.present();
        return;
    }

    const modal = await this.modalCtrl.create({
        component: AddTimeModalComponent,
        breakpoints: [0, 0.5, 0.8],
        initialBreakpoint: 0.5,
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm' && data?.nome) {
        const loading = await this.loadingCtrl.create({
            message: 'Salvando equipe...',
        });
        await loading.present();

        try {
            const id = await this.timeService.addTime(data, this.campeonatoId);
            console.log('Equipe salva no Firebase com ID:', id);

            const alert = await this.alertCtrl.create({
                header: 'Sucesso!',
                message: 'Equipe criada com sucesso!',
                buttons: ['OK'],
            });
            await alert.present();

        } catch (error) {
            console.error('Erro ao salvar equipe no Firebase:', error);
            const alert = await this.alertCtrl.create({
                header: 'Erro',
                message: 'Não foi possível salvar a equipe. Tente novamente.',
                buttons: ['OK'],
            });
            await alert.present();
        } finally {
            loading.dismiss();
        }
        await this.loadTimes();
    } else {
        console.log('Criação de equipe cancelada ou sem dados válidos.');
    }
  }

  comecarCampeonato() {
    console.log('Iniciando campeonato...');
  }

  abrirEquipe(equipeNome: string) {
    console.log('Abrindo detalhes da equipe:', equipeNome);
  }
}