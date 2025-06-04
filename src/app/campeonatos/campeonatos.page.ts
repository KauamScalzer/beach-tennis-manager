import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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

addIcons({
  'search-outline': searchOutline,
  'add-outline': addOutline,
  'trophy-outline': trophyOutline,
  'people-outline': peopleOutline,
  'arrow-back-outline': arrowBackOutline,
});

@Component({
  selector: 'app-campeonatos',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, CardListComponent],
  templateUrl: './campeonatos.page.html',
  styleUrls: ['./campeonatos.page.scss'],
})
export class CampeonatosPage {
  filtro = '';
  campeonatos = [
    'CAMPEONATO 1',
    'CAMPEONATO 2',
    'CAMPEONATO 3',
    'CAMPEONATO 4',
    'CAMPEONATO 5',
  ];

  campeonatosFiltrados() {
    return this.campeonatos.filter((nome) =>
      nome.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  adicionarCampeonato() {
    console.log('Abrir tela para criar novo campeonato');
  }

  abrirCampeonato(nome: string) {
    console.log('Abrir detalhes do campeonato:', nome);
  }
}
