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
  createOutline,
  trashOutline,
} from 'ionicons/icons';
import { HeaderComponent } from '../header/header.component';
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
  'create-outline': createOutline,
  'trash-outline': trashOutline,
});

interface ICampeonato {
  id: string;
  nome: string;
  userId: string;
  status?: string;
  faseAtual?: string | null;
}

@Component({
  selector: 'app-campeonatos',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderComponent,
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

    Swal.fire({
      title: 'Carregando campeonatos...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      this.campeonatos = await this.campeonatoService.getCampeonatos(this.currentUserUid);
      console.log('Campeonatos carregados para o usuário', this.currentUserUid, ':', this.campeonatos);

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
    } finally {
      Swal.close();
    }
  }

  getFilteredCampeonatos(): ICampeonato[] {
    return this.campeonatos
      .filter(campeonato =>
        campeonato &&
        typeof campeonato.nome === 'string' &&
        campeonato.nome.toLowerCase().includes(this.filtro.toLowerCase())
      );
  }

  handleCampeonatoClick(campeonato: ICampeonato) {
    this.abrirCampeonato(campeonato);
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

        if (!nome.trim()) {
          Swal.showValidationMessage('Nome do campeonato é obrigatório');
          return false;
        }

        return {
          nome: nome.trim()
        };
      }
    });

    if (formValues) {
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
      } finally {
        Swal.close();
      }
    } else {
      console.log('Criação de campeonato cancelada ou sem dados válidos.');
    }
  }

  abrirCampeonato(campeonato: ICampeonato) {
    console.log('Abrir detalhes do campeonato:', campeonato.nome, 'ID:', campeonato.id);
    this.router.navigate(['/times', campeonato.id]);
  }

  async editarCampeonato(campeonato: ICampeonato) {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Campeonato',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <label for="swal-input1" style="display: block; margin-bottom: 8px; font-weight: 500;">
            Novo Nome do Campeonato
          </label>
          <input
            id="swal-input1"
            class="swal2-input"
            placeholder="Digite o novo nome do campeonato"
            value="${campeonato.nome}"
            style="margin: 0; width: 100%;"
            autofocus
          >
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

        if (!nome.trim()) {
          Swal.showValidationMessage('Nome do campeonato é obrigatório');
          return false;
        }

        return {
          nome: nome.trim()
        };
      }
    });

    if (formValues && campeonato.id) {
      Swal.fire({
        title: 'Atualizando campeonato...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await this.campeonatoService.updateCampeonato(campeonato.id, { nome: formValues.nome });
        console.log('Campeonato atualizado no Firebase:', campeonato.id);
        await this.loadCampeonatos();

      } catch (error) {
        console.error('Erro ao atualizar campeonato no Firebase:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível atualizar o campeonato. Tente novamente.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-ionic-popup',
            confirmButton: 'swal-ionic-button swal-confirm'
          },
          buttonsStyling: false
        });
      } finally {
        Swal.close();
      }
    } else if (formValues && !campeonato.id) {
        console.error('ID do campeonato não encontrado para atualização.');
        await Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível identificar o campeonato para atualizar.',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal-ionic-popup',
                confirmButton: 'swal-ionic-button swal-confirm'
            },
            buttonsStyling: false
        });
    } else {
        console.log('Edição de campeonato cancelada ou sem dados válidos.');
    }
  }

  async excluirCampeonato(campeonato: ICampeonato) {
    if (!campeonato.id) {
      console.error('ID do campeonato não encontrado para exclusão.');
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível identificar o campeonato para excluir.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: `Tem certeza que deseja excluir o campeonato "${campeonato.nome}"?`,
      text: 'Essa ação não pode ser desfeita e todas as equipes e partidas associadas serão perdidas!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal2-container',
        popup: 'swal-ionic-popup',
        confirmButton: 'swal-ionic-button swal-confirm-danger',
        cancelButton: 'swal-ionic-button swal-cancel'
      },
      buttonsStyling: false,
      heightAuto: false,
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Excluindo campeonato...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await this.campeonatoService.deleteCampeonato(campeonato.id);
        console.log('Campeonato excluído do Firebase:', campeonato.id);
        await this.loadCampeonatos();

      } catch (error) {
        console.error('Erro ao excluir campeonato do Firebase:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível excluir o campeonato. Tente novamente.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal-ionic-popup',
            confirmButton: 'swal-ionic-button swal-confirm'
          },
          buttonsStyling: false
        });
      } finally {
        Swal.close();
      }
    } else {
      console.log('Exclusão de campeonato cancelada.');
    }
  }
}
