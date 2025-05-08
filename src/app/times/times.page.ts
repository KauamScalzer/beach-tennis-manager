import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, play } from 'ionicons/icons';

addIcons({
  'add-outline': addOutline,
  'play': play,
});

@Component({
  selector: 'app-times',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './times.page.html',
  styleUrls: ['./times.page.scss'],
})
export class TimesPage {
  equipes = ['EQUIPE 1', 'EQUIPE 2', 'EQUIPE 3', 'EQUIPE 4', 'EQUIPE 5'];

  adicionarEquipe() {
    // lógica para adicionar equipe
  }

  comecarCampeonato() {
    // lógica para iniciar campeonato
  }

  abrirEquipe(equipe: string) {
    // lógica para abrir detalhes da equipe
  }
}
