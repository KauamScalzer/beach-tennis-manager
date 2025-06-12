import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

addIcons({
  'close-outline': closeOutline,
});

interface NovoCampeonatoData {
  nome: string;
  descricao?: string;
}

@Component({
  selector: 'app-add-campeonato-modal',
  templateUrl: './add-campeonato-modal.component.html',
  styleUrls: ['./add-campeonato-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class AddCampeonatoModalComponent implements OnInit {

  nomeCampeonato: string = '';
  descricaoCampeonato: string = '';

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() { }

  fechar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  adicionar() {
    const nomeTrimmed = this.nomeCampeonato.trim();

    if (nomeTrimmed === '') {
      console.warn('O nome do campeonato não pode ser vazio.');
      return;
    }

    const novoCampeonato: NovoCampeonatoData = {
      nome: nomeTrimmed.toUpperCase(),
      descricao: this.descricaoCampeonato.trim()
    };

    this.modalCtrl.dismiss(novoCampeonato, 'confirm');
  }
}
