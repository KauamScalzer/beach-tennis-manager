import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';  // Mantenha apenas o IonicModule
import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

addIcons({
  'chevron-back-outline': chevronBackOutline,
  'chevron-forward-outline': chevronForwardOutline,
});

@Component({
  selector: 'app-rodada',
  templateUrl: './rodada.page.html',
  styleUrls: ['./rodada.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]  // Não é necessário o IonContent aqui
})
export class RodadaPage {
  partidas = [
    { equipeA: 'Equipe 1', pontuacao: '4 - 3', equipeB: 'Equipe 1' },
    { equipeA: 'Equipe 1', pontuacao: '4 - 3', equipeB: 'Equipe 1' }
  ];

  avancarFase() {
    console.log('Avançar para a próxima fase');
  }

  voltarFase() {
    console.log('Voltar para a fase anterior');
  }
}
