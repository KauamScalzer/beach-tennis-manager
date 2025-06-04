import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, play } from 'ionicons/icons';
import { HeaderComponent } from '../header/header.component';
import { CardListComponent } from '../card-list/card-list.component';
import { AddTimeModalComponent } from '../add-time-modal/add-time-modal.component';

addIcons({
  'add-outline': addOutline,
  'play': play,
});

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
export class TimesPage {
  equipes: string[] = [];  // <-- aqui, array vazio no início

  constructor(private modalCtrl: ModalController) {}

  async adicionarEquipe() {
    const modal = await this.modalCtrl.create({
      component: AddTimeModalComponent,
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5,
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.nome) {
      this.equipes = [...this.equipes, data.nome];
    }
  }

  comecarCampeonato() {
    console.log('Iniciando campeonato...');
  }

  abrirEquipe(equipe: string) {
    console.log('Abrindo detalhes da equipe:', equipe);
  }
}
