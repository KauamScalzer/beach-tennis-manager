import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, play, arrowBackOutline, createOutline, trashOutline } from 'ionicons/icons'; // Adicione createOutline e trashOutline
import { HeaderComponent } from '../header/header.component';

import { TimeService } from '../services/time/time.service';
import { MatchService } from '../services/match/match.service';
import { CampeonatoService } from '../services/campeonato/campeonato.service';
import { IMatch } from '../interfaces/imatch';
import { ICampeonato } from '../interfaces/icampeonato';
import { ITime } from '../interfaces/itime';
import Swal from 'sweetalert2';

addIcons({
  'add-outline': addOutline,
  'play': play,
  'arrow-back-outline': arrowBackOutline,
  'create-outline': createOutline, // Adicione o ícone de editar
  'trash-outline': trashOutline,   // Adicione o ícone de excluir
});

@Component({
  selector: 'app-times',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    HeaderComponent,
  ],
  templateUrl: './times.page.html',
  styleUrls: ['./times.page.scss'],
})
export class TimesPage implements OnInit {
  equipes: ITime[] = [];
  campeonatoId: string | null = null;
  campeonato: ICampeonato | null = null;
  hasStarted: boolean = false;

  private phaseOrderMap: { [key: string]: number } = {
    'Final': 1,
    'Semifinal': 2,
    'Quartas de Final': 3,
    'Oitavas de Final': 4,
    '16-avos de Final': 5,
    '32-avos de Final': 6,
  };

  private orderPhaseMap: { [key: number]: string } = {
    1: 'Final',
    2: 'Semifinal',
    3: 'Quartas de Final',
    4: 'Oitavas de Final',
    5: '16-avos de Final',
    6: '32-avos de Final',
  };

  private orderedPhases: string[] = Object.keys(this.phaseOrderMap).sort((a, b) => this.phaseOrderMap[a] - this.phaseOrderMap[b]);

  constructor(
    private activatedRoute: ActivatedRoute,
    private timeService: TimeService,
    private matchService: MatchService,
    private campeonatoService: CampeonatoService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async params => {
      this.campeonatoId = params.get('campeonatoId');
      if (this.campeonatoId) {
        console.log('ID do Campeonato:', this.campeonatoId);
        await this.loadCampeonatoData();

        this.activatedRoute.queryParams.subscribe(queryParams => {
          const forceShowTeams = queryParams['showTeams'];

          if (this.hasStarted && this.campeonato?.faseAtual && !forceShowTeams) {
            console.log('Campeonato já iniciado. Redirecionando para rodadas...');
            this.router.navigate(['/rodada', this.campeonatoId, this.campeonato.faseAtual], { replaceUrl: true });
          }
        });
      } else {
        console.warn('Nenhum ID de campeonato fornecido na rota.');
        this.router.navigateByUrl('/campeonatos', { replaceUrl: true });
      }
    });
  }

  async loadCampeonatoData() {
    if (!this.campeonatoId) return;

    Swal.fire({
      title: 'Carregando dados do campeonato...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      this.campeonato = await this.campeonatoService.getCampeonatoById(this.campeonatoId);
      if (this.campeonato) {
        this.hasStarted = this.campeonato.status === 'em_andamento' || this.campeonato.status === 'finalizado';
        console.log('Campeonato carregado:', this.campeonato);
        await this.loadTimes();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Campeonato não encontrado.',
          confirmButtonText: 'OK',
        });
        this.router.navigateByUrl('/campeonatos', { replaceUrl: true });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do campeonato:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível carregar os dados do campeonato.',
        confirmButtonText: 'OK',
      });
    } finally {
      Swal.close();
    }
  }

  async loadTimes() {
    if (!this.campeonatoId) {
      console.warn('Não é possível carregar times: Campeonato ID não definido.');
      return;
    }
    try {
      this.equipes = await this.timeService.getTimes(this.campeonatoId);
      console.log('Equipes carregadas para o campeonato', this.campeonatoId, ':', this.equipes);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível carregar as equipes.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        },
      });
    }
  }

  // Remova ou adapte getEquipeNomes() se não for mais necessário
  // getEquipeNomes(): string[] {
  //   return this.equipes.map(e => e.nome);
  // }

  async adicionarEquipe() {
    if (this.hasStarted) {
      await Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Não é possível adicionar equipes após o campeonato ter sido iniciado.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        }
      });
      return;
    }

    if (!this.campeonatoId) {
      console.error('Não é possível adicionar equipe: Campeonato ID não definido.');
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível determinar o campeonato para adicionar a equipe.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        }
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Adicionar Equipe',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <label for="swal-input1" style="display: block; margin-bottom: 8px; font-weight: 500;">
            Nome da Equipe
          </label>
          <input
            id="swal-input1"
            class="swal2-input"
            placeholder="Digite o nome da equipe"
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
          Swal.showValidationMessage('Nome da equipe é obrigatório');
          return false;
        }

        return {
          nome: nome.trim()
        };
      }
    });

    if (formValues) {
      Swal.fire({
        title: 'Salvando equipe...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const id = await this.timeService.addTime(formValues, this.campeonatoId);
        console.log('Equipe salva no Firebase com ID:', id);

        await this.loadTimes();

      } catch (error) {
        console.error('Erro ao salvar equipe no Firebase:', error);

        await Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível salvar a equipe. Tente novamente.',
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
      console.log('Criação de equipe cancelada ou sem dados válidos.');
    }
  }

  async handleStartOrViewCampeonato() {
    if (this.hasStarted) {
      if (this.campeonato?.faseAtual) {
        this.router.navigate(['/rodada', this.campeonatoId, this.campeonato.faseAtual]);
      } else {
        console.error('Campeonato iniciado, mas faseAtual não definida. Redirecionando para campeonatos.');
        await Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Fase atual não definida. Verifique o campeonato.',
          confirmButtonText: 'OK',
          customClass: {
            confirmButton: 'swal-ionic-button'
          },
        });
        this.router.navigateByUrl('/campeonatos', { replaceUrl: true });
      }
    } else {
      await this.startCampeonato();
    }
  }

  private async startCampeonato() {
    if (!this.campeonatoId) {
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'ID do campeonato não encontrado.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        },
      });
      return;
    }

    if (this.equipes.length < 2) {
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'É necessário ter pelo menos 2 equipes para iniciar o campeonato.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        },
      });
      return;
    }

    Swal.fire({
      title: 'Sorteando equipes e criando a tabela inicial...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const shuffledTeams = [...this.equipes].sort(() => Math.random() - 0.5);
      console.log('Equipes embaralhadas:', shuffledTeams.map(t => t.nome));

      const numTeams = shuffledTeams.length;
      let effectiveNumTeamsForRound = 2;
      let initialPhaseOrder = 1;

      while (effectiveNumTeamsForRound < numTeams) {
        effectiveNumTeamsForRound *= 2;
        initialPhaseOrder++;
      }

      if (!this.orderPhaseMap[initialPhaseOrder]) {
          initialPhaseOrder = Math.max(...Object.values(this.phaseOrderMap));
          console.warn(`Número de times (${numTeams}) excede fases mapeadas. Usando a fase inicial mais profunda: ${this.orderPhaseMap[initialPhaseOrder]}`);
      }

      const initialPhaseName = this.orderPhaseMap[initialPhaseOrder];

      const matchesCreated: IMatch[] = [];
      let numRealMatches = Math.floor(numTeams / 2);
      let numByes = numTeams % 2;

      const teamsWithByes: ITime[] = [];
      for (let i = 0; i < numByes; i++) {
        teamsWithByes.push(shuffledTeams.pop()!);
      }

      let partidaNaFaseCounter = 1;

      for (let i = 0; i < numRealMatches; i++) {
        const timeA = shuffledTeams[i * 2];
        const timeB = shuffledTeams[i * 2 + 1];

        const match: IMatch = {
          campeonatoId: this.campeonatoId,
          fase: initialPhaseName,
          ordemFase: initialPhaseOrder,
          partidaNaFase: partidaNaFaseCounter++,
          timeAId: timeA.id,
          timeANome: timeA.nome,
          timeBId: timeB.id,
          timeBNome: timeB.nome,
          vencedorId: null,
          vencedorNome: null,
          placarTimeA: 0,
          placarTimeB: 0,
        };
        const matchId = await this.matchService.addMatch(match);
        matchesCreated.push({ ...match, id: matchId });
      }

      for (const teamBye of teamsWithByes) {
        const byeMatch: IMatch = {
          campeonatoId: this.campeonatoId,
          fase: initialPhaseName,
          ordemFase: initialPhaseOrder,
          partidaNaFase: partidaNaFaseCounter++,
          timeAId: teamBye.id,
          timeANome: teamBye.nome,
          timeBId: null,
          timeBNome: null,
          vencedorId: teamBye.id,
          vencedorNome: teamBye.nome,
          placarTimeA: 0,
          placarTimeB: 0,
        };
        const byeMatchId = await this.matchService.addMatch(byeMatch);
        matchesCreated.push({ ...byeMatch, id: byeMatchId });
      }

      await this.campeonatoService.updateCampeonato(this.campeonatoId, {
        faseAtual: initialPhaseName,
        status: 'em_andamento'
      });
      if (this.campeonato) {
        this.campeonato.faseAtual = initialPhaseName;
        this.campeonato.status = 'em_andamento';
      }
      this.hasStarted = true;

      await Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: `Campeonato iniciado! A fase de ${initialPhaseName} foi criada.`,
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        }
      });

      this.router.navigate(['/rodada', this.campeonatoId, initialPhaseName]);

    } catch (error) {
      console.error('Erro ao iniciar campeonato ou criar tabela inicial:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível iniciar o campeonato. Tente novamente.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        }
      });
    } finally {
      Swal.close();
    }
  }

  abrirEquipe(equipe: ITime) { // Altere para receber o objeto ITime completo
    console.log('Abrindo detalhes da equipe:', equipe.nome, 'ID:', equipe.id);
    // Implemente a navegação ou modal para detalhes da equipe aqui
    // Ex: this.router.navigate(['/equipe-detalhes', equipe.id]);
  }

  // --- Novos métodos para Editar e Excluir ---

  async editarEquipe(equipe: ITime) {
    if (this.hasStarted) {
      await Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Não é possível editar equipes após o campeonato ter sido iniciado.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        }
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Editar Equipe',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <label for="swal-input1" style="display: block; margin-bottom: 8px; font-weight: 500;">
            Nome da Equipe
          </label>
          <input
            id="swal-input1"
            class="swal2-input"
            placeholder="Digite o novo nome da equipe"
            value="${equipe.nome}"
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
          Swal.showValidationMessage('Nome da equipe é obrigatório');
          return false;
        }

        return {
          nome: nome.trim()
        };
      }
    });

    if (formValues && equipe.id) {
      Swal.fire({
        title: 'Atualizando equipe...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await this.timeService.updateTime(equipe.id, formValues);
        console.log('Equipe atualizada no Firebase:', equipe.id);
        await this.loadTimes(); // Recarrega as equipes após atualizar

      } catch (error) {
        console.error('Erro ao atualizar equipe no Firebase:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível atualizar a equipe. Tente novamente.',
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
    } else if (formValues && !equipe.id) {
        console.error('ID da equipe não encontrado para atualização.');
        await Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível identificar a equipe para atualizar.',
            confirmButtonText: 'OK',
            customClass: {
                popup: 'swal-ionic-popup',
                confirmButton: 'swal-ionic-button swal-confirm'
            },
            buttonsStyling: false
        });
    } else {
        console.log('Edição de equipe cancelada ou sem dados válidos.');
    }
  }

  async excluirEquipe(equipe: ITime) {
    if (this.hasStarted) {
      await Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Não é possível excluir equipes após o campeonato ter sido iniciado.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        }
      });
      return;
    }

    if (!equipe.id) {
      console.error('ID da equipe não encontrado para exclusão.');
      await Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível identificar a equipe para excluir.',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal-ionic-button'
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: `Tem certeza que deseja excluir a equipe "${equipe.nome}"?`,
      text: 'Essa ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'swal2-container',
        popup: 'swal-ionic-popup',
        confirmButton: 'swal-ionic-button swal-confirm-danger', // Nova classe para botão de exclusão
        cancelButton: 'swal-ionic-button swal-cancel'
      },
      buttonsStyling: false,
      heightAuto: false,
    });

    if (result.isConfirmed) {
      await this.loadTimes()
      Swal.fire({
        title: 'Excluindo equipe...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await this.timeService.deleteTime(equipe.id);
        console.log('Equipe excluída do Firebase:', equipe.id);
        await this.loadTimes(); // Recarrega as equipes após excluir
        
        

      } catch (error) {
        console.error('Erro ao excluir equipe do Firebase:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível excluir a equipe. Tente novamente.',
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
      console.log('Exclusão de equipe cancelada.');
    }
  }
}