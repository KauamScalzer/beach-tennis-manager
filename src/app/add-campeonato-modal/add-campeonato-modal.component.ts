import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular'; // Remova LoadingController e AlertController
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
    private modalCtrl: ModalController,
    // REMOVA: private campeonatoService: CampeonatoService,
    // REMOVA: private loadingCtrl: LoadingController,
    // REMOVA: private alertCtrl: AlertController
  ) { }

  ngOnInit() { }

  fechar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  // Marque como síncrono novamente, pois não haverá operações assíncronas de salvamento aqui
  adicionar() {
    const nomeTrimmed = this.nomeCampeonato.trim();

    if (nomeTrimmed === '') {
      // Opcional: Você pode querer manter um alerta BÁSICO aqui para o usuário saber que o campo é obrigatório ANTES de tentar fechar.
      // Ou, alternativamente, apenas desabilitar o botão "Salvar" se o nome estiver vazio.
      console.warn('O nome do campeonato não pode ser vazio.');
      // O modal pode ser dismissed com um erro ou simplesmente não ser dismissed
      // Para manter a simplicidade, vamos apenas retornar e o botão ficará "morto" até preencher.
      return;
    }

    const novoCampeonato: NovoCampeonatoData = {
      nome: nomeTrimmed.toUpperCase(),
      descricao: this.descricaoCampeonato.trim()
    };

    // SIMPLESMENTE DISMISS O MODAL E PASSE OS DADOS
    this.modalCtrl.dismiss(novoCampeonato, 'confirm');
  }
}