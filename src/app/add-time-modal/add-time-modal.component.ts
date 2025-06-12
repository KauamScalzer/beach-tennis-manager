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
    this.modalCtrl.dismiss(null, 'cancel');
  }

  adicionar() {
    const nomeTrim = this.nome.trim();
    if (nomeTrim) {
      this.modalCtrl.dismiss({ nome: nomeTrim.toUpperCase() }, 'confirm');
    }
  }
}
