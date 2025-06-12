import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, play, arrowBackOutline, createOutline, trashOutline } from 'ionicons/icons';
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
  'create-outline': createOutline,
  'trash-outline': trashOutline,
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
        await this.loadCampeonatoData();

        this.activatedRoute.queryParams.subscribe(queryParams => {
          const forceShowTeams = queryParams['showTeams'];

          if (this.hasStarted && this.campeonato?.faseAtual && !forceShowTeams) {
            this.router.navigate(['/rodada', this.campeonatoId, this.campeonato.faseAtual], { replaceUrl: true });
          }
        });
      } else {
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
      return;
    }
    try {
      this.equipes = await this.timeService.getTimes(this.campeonatoId);
    } catch (error) {
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
        await this.loadTimes();

      } catch (error) {
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
    }
  }

  async handleStartOrViewCampeonato() {
    if (this.hasStarted) {
      if (this.campeonato?.faseAtual) {
        this.router.navigate(['/rodada', this.campeonatoId, this.campeonato.faseAtual]);
      } else {
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

      const numTeams = shuffledTeams.length;
      let effectiveNumTeamsForRound = 2;
      let initialPhaseOrder = 1;

      while (effectiveNumTeamsForRound < numTeams) {
        effectiveNumTeamsForRound *= 2;
        initialPhaseOrder++;
      }

      if (!this.orderPhaseMap[initialPhaseOrder]) {
          initialPhaseOrder = Math.max(...Object.values(this.phaseOrderMap));
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

      this.router.navigate(['/rodada', this.campeonatoId, initialPhaseName]);

    } catch (error) {
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

  abrirEquipe(equipe: ITime) {
  }

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
        await this.loadTimes();

      } catch (error) {
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
        confirmButton: 'swal-ionic-button swal-confirm-danger',
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
        await this.loadTimes();
      } catch (error) {
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
    }
  }
}
