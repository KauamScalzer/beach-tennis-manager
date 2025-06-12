import { Component, OnInit } from '@angular/core';
import { IonicModule, LoadingController, AlertController, Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  arrowForwardOutline,
  trophyOutline,
  copyOutline,
} from 'ionicons/icons';

import { IMatch } from '../interfaces/imatch';
import { MatchService } from '../services/match/match.service';
import { CampeonatoService } from '../services/campeonato/campeonato.service';
import { AuthService } from '../services/auth/auth.service';
import { ICampeonato } from '../interfaces/icampeonato';

addIcons({
  'arrow-back-outline': arrowBackOutline,
  'arrow-forward-outline': arrowForwardOutline,
  'trophy-outline': trophyOutline,
  'copy-outline': copyOutline,
});

interface ITime {
  id: string;
  nome: string;
  campeonatoId: string;
}

@Component({
  selector: 'app-rodada',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderComponent,
  ],
  templateUrl: './rodada.page.html',
  styleUrls: ['./rodada.page.scss'],
})
export class RodadaPage implements OnInit {
  campeonatoId: string | null = null;
  faseAtualNome: string | null = null;
  faseAtualOrdem: number = 0;

  matches: IMatch[] = [];
  allMatches: IMatch[] = [];

  canAdvancePhase: boolean = false;
  isLastPhase: boolean = false;
  campeaoNome: string | null = null;

  isOwner: boolean = false;
  currentUserUid: string | null = null;

  phaseOrderMap: { [key: string]: number } = {
    'Rodada 1': 1,
    'Quartas de Final': 2,
    'Semifinal': 3,
    'Final': 4,
  };
  orderPhaseMap: { [key: number]: string } = {
    1: 'Rodada 1',
    2: 'Quartas de Final',
    3: 'Semifinal',
    4: 'Final',
  };

  private orderedPhases: string[] = Object.keys(this.phaseOrderMap).sort((a, b) => this.phaseOrderMap[a] - this.phaseOrderMap[b]);

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private matchService: MatchService,
    private campeonatoService: CampeonatoService,
    private authService: AuthService,
    private platform: Platform,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadPageDataFromRoute();
      }
    });
  }

  async ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserUid = user?.uid || null;
      console.log('Current User UID:', this.currentUserUid);
    });
    await this.loadPageDataFromRoute();
  }

  private async loadPageDataFromRoute() {
    const publicAccessCode = this.activatedRoute.snapshot.paramMap.get('codigoAcessoPublico');

    if (publicAccessCode) {
      console.log('Acesso via código público:', publicAccessCode);
      const campeonato = await this.campeonatoService.getCampeonatoByCodigoAcesso(publicAccessCode);
      if (campeonato) {
        this.campeonatoId = campeonato.id;
        this.faseAtualNome = campeonato.faseAtual || this.orderedPhases[0];
        this.faseAtualOrdem = this.phaseOrderMap[this.faseAtualNome];
        this.isOwner = this.currentUserUid === campeonato.userId;
        if (!campeonato.faseAtual) {
          console.warn('Campeonato sem faseAtual definida. Redirecionando para a primeira fase mapeada.');
          this.router.navigate(['/publico', publicAccessCode, this.orderedPhases[0]], { replaceUrl: true });
          return;
        }
        console.log('Campeonato encontrado pelo código:', campeonato);
        await this.loadMatches();
      } else {
        console.error('Campeonato não encontrado para o código de acesso público:', publicAccessCode);
        const alert = await this.alertCtrl.create({
          header: 'Erro',
          message: 'Código de acesso inválido ou campeonato não encontrado.',
          buttons: ['OK'],
        });
        await alert.present();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    } else {
      this.campeonatoId = this.activatedRoute.snapshot.paramMap.get('campeonatoId');
      this.faseAtualNome = this.activatedRoute.snapshot.paramMap.get('fase');

      if (this.campeonatoId && this.faseAtualNome) {
        this.faseAtualOrdem = this.phaseOrderMap[this.faseAtualNome];
        console.log(`Carregando Rodada: ${this.faseAtualNome} (${this.faseAtualOrdem}) para Campeonato: ${this.campeonatoId}`);
        const campeonato = await this.campeonatoService.getCampeonatoById(this.campeonatoId);
        this.isOwner = (campeonato && this.currentUserUid === campeonato.userId) || false;
        await this.loadMatches();
      } else {
        console.error('Parâmetros de rota incompletos para RodadaPage.');
        this.router.navigateByUrl('/campeonatos', { replaceUrl: true });
      }
    }
  }

  get headerTitle(): string {
    return this.faseAtualNome || 'Carregando...';
  }

  get hasNextPhaseInHistory(): boolean {
    const nextOrder = this.faseAtualOrdem + 1;
    const nextPhaseName = this.orderedPhases[nextOrder - 1];
    return !!nextPhaseName && this.allMatches.some(m => m.fase === nextPhaseName);
  }

  async loadMatches() {
    if (!this.campeonatoId || !this.faseAtualNome) return;

    const loading = await this.loadingCtrl.create({
      message: 'Carregando partidas...',
    });
    await loading.present();

    try {
      this.matches = await this.matchService.getMatchesByPhase(this.campeonatoId, this.faseAtualNome);
      this.allMatches = await this.matchService.getAllMatchesForChampionship(this.campeonatoId);

      const maxOrder = Math.max(...Object.values(this.phaseOrderMap));
      this.isLastPhase = this.faseAtualOrdem === maxOrder;

      const campeonatoData = await this.campeonatoService.getCampeonatoById(this.campeonatoId);
      if (campeonatoData?.status === 'finalizado' && campeonatoData?.campeaoNome) {
        this.campeaoNome = campeonatoData.campeaoNome;
        this.canAdvancePhase = false;
      } else if (this.isOwner) {
        this.canAdvancePhase = await this.matchService.areAllMatchesFinishedInPhase(this.campeonatoId, this.faseAtualNome);
      } else {
        this.canAdvancePhase = false;
      }
      console.log('Partidas da fase atual:', this.matches);
      console.log('Todas as partidas (para histórico):', this.allMatches);
      console.log('Pode avançar de fase:', this.canAdvancePhase);
      console.log('É a última fase:', this.isLastPhase);
    } catch (error) {
      console.error('Erro ao carregar partidas:', error);
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível carregar as partidas.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      loading.dismiss();
    }
  }

  goToPreviousPhase() {
    const previousOrder = this.faseAtualOrdem - 1;
    if (previousOrder >= 1) {
      const previousPhaseName = this.orderedPhases[previousOrder - 1];
      if (previousPhaseName) {
        this.router.navigate(['/rodada', this.campeonatoId, previousPhaseName]);
      }
    }
  }

  goToNextPhaseInHistory() {
    const nextOrder = this.faseAtualOrdem + 1;
    const nextPhaseName = this.orderedPhases[nextOrder - 1];

    if (nextPhaseName && this.allMatches.some(m => m.fase === nextPhaseName)) {
        this.router.navigate(['/rodada', this.campeonatoId, nextPhaseName]);
    } else {
      console.log('Não há próxima fase no histórico ainda ou já é a fase atual do campeonato.');
    }
  }

  async updateScore(match: IMatch, team: 'A' | 'B', increment: number) {
    if (!this.isOwner || match.vencedorId) {
      return;
    }

    const newScore = team === 'A' ? match.placarTimeA + increment : match.placarTimeB + increment;
    if (newScore < 0) return;

    const updatedData: Partial<IMatch> = {};
    if (team === 'A') {
      updatedData.placarTimeA = newScore;
    } else {
      updatedData.placarTimeB = newScore;
    }

    if (team === 'A') match.placarTimeA = newScore;
    else match.placarTimeB = newScore;

    if (match.placarTimeA >= 2) {
      updatedData.vencedorId = match.timeAId;
      updatedData.vencedorNome = match.timeANome;
      match.vencedorId = match.timeAId;
      match.vencedorNome = match.timeANome;
      const alert = await this.alertCtrl.create({
        header: 'Vencedor!',
        message: `${match.timeANome} venceu a partida!`,
        buttons: ['OK'],
      });
      await alert.present();
    } else if (match.placarTimeB >= 2) {
      updatedData.vencedorId = match.timeBId;
      updatedData.vencedorNome = match.timeBNome;
      match.vencedorId = match.timeBId;
      match.vencedorNome = match.timeBNome;
      const alert = await this.alertCtrl.create({
        header: 'Vencedor!',
        message: `${match.timeBNome} venceu a partida!`,
        buttons: ['OK'],
      });
      await alert.present();
    }

    await this.matchService.updateMatch(match.id!, updatedData);
    if (this.isOwner) {
      this.canAdvancePhase = await this.matchService.areAllMatchesFinishedInPhase(this.campeonatoId!, this.faseAtualNome!);
    }
  }

  async advancePhase() {
    if (!this.campeonatoId || !this.faseAtualNome) return;

    if (!this.canAdvancePhase) {
      const alert = await this.alertCtrl.create({
        header: 'Atenção',
        message: 'Todas as partidas da fase atual devem estar finalizadas para avançar.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Gerando próxima fase...',
    });
    await loading.present();

    try {
      const currentPhaseMatches = this.matches;
      const winners: ITime[] = [];

      for (const match of currentPhaseMatches) {
        if (match.vencedorId && match.vencedorNome) {
          winners.push({
            id: match.vencedorId,
            nome: match.vencedorNome,
            campeonatoId: this.campeonatoId
          });
        }
      }

      const shuffledWinners = [...winners].sort(() => Math.random() - 0.5);

      if (shuffledWinners.length === 1 && this.isLastPhase) {
        const campeao = shuffledWinners[0];
        await this.campeonatoService.updateCampeonato(this.campeonatoId, {
          status: 'finalizado',
          campeaoId: campeao.id,
          campeaoNome: campeao.nome,
          faseAtual: 'Finalizado'
        });
        this.campeaoNome = campeao.nome;
        this.canAdvancePhase = false;
        const alert = await this.alertCtrl.create({
          header: 'Campeão!',
          message: `${campeao.nome} é o grande campeão! Parabéns!`,
          buttons: ['OK'],
        });
        await alert.present();
        loading.dismiss();
        return;
      }

      const nextPhaseOrder = this.faseAtualOrdem + 1;
      const nextPhaseName = this.orderedPhases[nextPhaseOrder - 1];

      if (!nextPhaseName) {
        const alert = await this.alertCtrl.create({
          header: 'Fim do Campeonato',
          message: 'Não há mais fases para avançar. O campeonato está completo!',
          buttons: ['OK'],
        });
        await alert.present();
        loading.dismiss();
        return;
      }

      const newMatches: IMatch[] = [];
      let winnerIndex = 0;

      let numRealMatchesNextPhase = Math.floor(shuffledWinners.length / 2);
      let numByesNextPhase = shuffledWinners.length % 2;

      const winnersWithByesNextPhase: ITime[] = [];
      for (let i = 0; i < numByesNextPhase; i++) {
        winnersWithByesNextPhase.push(shuffledWinners.pop()!);
      }

      let partidaNaFaseCounter = 1;

      for (let i = 0; i < numRealMatchesNextPhase; i++) {
        const timeA = shuffledWinners[i * 2];
        const timeB = shuffledWinners[i * 2 + 1];

        const match: IMatch = {
          campeonatoId: this.campeonatoId,
          fase: nextPhaseName,
          ordemFase: nextPhaseOrder,
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
        newMatches.push({ ...match, id: matchId });
      }

      for (const winnerBye of winnersWithByesNextPhase) {
        const byeMatch: IMatch = {
          campeonatoId: this.campeonatoId,
          fase: nextPhaseName,
          ordemFase: nextPhaseOrder,
          partidaNaFase: partidaNaFaseCounter++,
          timeAId: winnerBye.id,
          timeANome: winnerBye.nome,
          timeBId: null,
          timeBNome: null,
          vencedorId: winnerBye.id,
          vencedorNome: winnerBye.nome,
          placarTimeA: 0,
          placarTimeB: 0,
        };
        const byeMatchId = await this.matchService.addMatch(byeMatch);
        newMatches.push({ ...byeMatch, id: byeMatchId });
      }

      await this.campeonatoService.updateCampeonato(this.campeonatoId, { faseAtual: nextPhaseName });

      const alert = await this.alertCtrl.create({
        header: 'Sucesso!',
        message: `A ${nextPhaseName} foi gerada!`,
        buttons: ['OK'],
      });
      await alert.present();

      this.router.navigate(['/rodada', this.campeonatoId, nextPhaseName]);

    } catch (error) {
      console.error('Erro ao avançar fase:', error);
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível avançar para a próxima fase.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      loading.dismiss();
    }
  }

  async copyPublicLink() {
    if (!this.campeonatoId) {
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível gerar o link: ID do campeonato ausente.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Gerando link...',
    });
    await loading.present();

    try {
      const campeonato = await this.campeonatoService.getCampeonatoById(this.campeonatoId);
      if (!campeonato || !campeonato.codigoAcessoPublico) {
        const alert = await this.alertCtrl.create({
          header: 'Erro',
          message: 'Campeonato ou código de acesso público não encontrado.',
          buttons: ['OK'],
        });
        await alert.present();
        return;
      }

      const currentHost = window.location.origin;
      const publicLink = `${currentHost}/publico/${campeonato.codigoAcessoPublico}`;

      if (this.platform.is('capacitor') || this.platform.is('cordova')) {
        const alert = await this.alertCtrl.create({
          header: 'Link Copiado!',
          message: `Link: ${publicLink}. Funcionalidade de cópia em app nativo requer plugin.`,
          buttons: ['OK'],
        });
        await alert.present();
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(publicLink);
        const alert = await this.alertCtrl.create({
          header: 'Link Copiado!',
          message: `O link foi copiado para a área de transferência: ${publicLink}`,
          buttons: ['OK'],
        });
        await alert.present();
      } else {
        const dummyElement = document.createElement('textarea');
        document.body.appendChild(dummyElement);
        dummyElement.value = publicLink;
        dummyElement.select();
        document.execCommand('copy');
        document.body.removeChild(dummyElement);

        const alert = await this.alertCtrl.create({
          header: 'Link Copiado!',
          message: `O link foi copiado para a área de transferência (via fallback): ${publicLink}`,
          buttons: ['OK'],
        });
        await alert.present();
      }
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível copiar o link. Tente manualmente.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      loading.dismiss();
    }
  }
}
