import { Component, OnInit } from '@angular/core';
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

import { CampeonatoService } from '../services/campeonato/campeonato.service';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';

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
    private campeonatoService: CampeonatoService,
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

    try {
      this.campeonatos = await this.campeonatoService.getCampeonatos(this.currentUserUid);
      console.log('Campeonatos carregados para o usuário', this.currentUserUid, ':', this.campeonatos);
      
      Swal.close();
      
    } catch (error) {
      console.error('Erro ao carregar campeonatos:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível carregar os campeonatos.',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal-ionic-popup',
          confirmButton: 'swal-ionic-button swal-confirm'
        },
        buttonsStyling: false
      });
    }
  }

  getCampeonatoNomesFiltrados(): string[] {
    return this.campeonatos
      .filter(campeonato =>
        campeonato &&
        typeof campeonato.nome === 'string' &&
        campeonato.nome.toLowerCase().includes(this.filtro.toLowerCase())
      )
      .map(campeonato => campeonato.nome);
  }

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
    if (!this.currentUserUid) {
      console.error('Não é possível adicionar campeonato: Usuário não logado.');
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Você precisa estar logado para criar um campeonato.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        }
      });
      return;
    }

    // SweetAlert2 substituindo o modal do Ionic
    const { value: formValues } = await Swal.fire({
      title: 'Adicionar Campeonato',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <label for="swal-input1" style="display: block; margin-bottom: 8px; font-weight: 500;">
            Nome do Campeonato
          </label>
          <input 
            id="swal-input1" 
            class="swal2-input" 
            placeholder="Digite o nome"
            style="margin: 0; width: 100%;"
            autofocus
          >
        </div>
        <div style="text-align: left;">
          <label for="swal-input2" style="display: block; margin-bottom: 8px; font-weight: 500;">
            Descrição (Opcional)
          </label>
          <textarea 
            id="swal-input2" 
            class="swal2-textarea" 
            placeholder="Descreva brevemente o campeonato"
            rows="3"
            style="margin: 0; width: 100%; resize: vertical;"
          ></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: true,
      backdrop: true,
      customClass: {
        container: 'swal2-container',
        popup: 'swal-ionic-popup',
        confirmButton: 'swal-ionic-button swal-confirm',
        cancelButton: 'swal-ionic-button swal-cancel'
      },
      buttonsStyling: false,
      heightAuto: false,
      preConfirm: () => {
        const nome = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const descricao = (document.getElementById('swal-input2') as HTMLTextAreaElement).value;
        
        if (!nome.trim()) {
          Swal.showValidationMessage('Nome do campeonato é obrigatório');
          return false;
        }
        
        return {
          nome: nome.trim(),
          descricao: descricao.trim()
        };
      }
    });

    if (formValues) {
      // Usar SweetAlert2 para loading também
      Swal.fire({
        title: 'Salvando campeonato...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const id = await this.campeonatoService.addCampeonato(formValues, this.currentUserUid);
        console.log('Campeonato salvo no Firebase com ID:', id);

        await this.loadCampeonatos();

      } catch (error) {
        console.error('Erro ao salvar campeonato no Firebase:', error);
        
        // Fechar loading e mostrar erro
        await Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível salvar o campeonato. Tente novamente.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-ionic-popup',
            confirmButton: 'swal-ionic-button swal-confirm'
          },
          buttonsStyling: false
        });
      }
    } else {
      console.log('Criação de campeonato cancelada ou sem dados válidos.');
    }
  }

  abrirCampeonato(campeonato: ICampeonato) {
    console.log('Abrir detalhes do campeonato:', campeonato.nome, 'ID:', campeonato.id);
    this.router.navigate(['/times', campeonato.id]);
  }
}