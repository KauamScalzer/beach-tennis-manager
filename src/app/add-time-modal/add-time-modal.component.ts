import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-time-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './add-time-modal.component.html',
  styleUrls: ['./add-time-modal.component.scss'],
})
export class AddTimeModalComponent {
  nome = '';

  constructor(private modalCtrl: ModalController) {}

  fechar() {
    // ✅ CORREÇÃO AQUI: Chame dismiss com null para data e 'cancel' para role
    this.modalCtrl.dismiss(null, 'cancel');
  }

  adicionar() {
    const nomeTrim = this.nome.trim();
    if (nomeTrim) {
      // ✅ CORREÇÃO AQUI: Chame dismiss com os dados E 'confirm' para role
      this.modalCtrl.dismiss({ nome: nomeTrim.toUpperCase() }, 'confirm');
    }
    // Se nomeTrim for vazio, o modal não será fechado,
    // o que é um bom comportamento para forçar o preenchimento.
  }
}