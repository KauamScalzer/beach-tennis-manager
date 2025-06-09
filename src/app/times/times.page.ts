import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, play, arrowBackOutline } from 'ionicons/icons';
import { HeaderComponent } from '../header/header.component';
import { CardListComponent } from '../card-list/card-list.component';
import { AddTimeModalComponent } from '../add-time-modal/add-time-modal.component';

import { TimeService } from '../services/time/time.service';
import { MatchService } from '../services/match/match.service';
import { CampeonatoService } from '../services/campeonato/campeonato.service';
import { IMatch } from '../interfaces/imatch'; // Importe IMatch
import { ICampeonato } from '../interfaces/icampeonato'; // Importe ICampeonato

addIcons({
  'add-outline': addOutline,
  'play': play,
  'arrow-back-outline': arrowBackOutline,
});

// Sua interface ITime existente
interface ITime {
  id: string;
  nome: string;
  campeonatoId: string;
}

@Component({
  selector: 'app-times',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
    HeaderComponent,
    CardListComponent,
  ],
  templateUrl: './times.page.html',
  styleUrls: ['./times.page.scss'],
})
export class TimesPage implements OnInit {
  // Removi as propriedades 'filtro' e 'campeonatos' se elas não são usadas diretamente nesta página,
  // ou você pode mantê-las se forem usadas em outra parte do template não mostrada aqui.
  // filtro = '';
  // campeonatos: ICampeonato[] = [];

  equipes: ITime[] = [];
  campeonatoId: string | null = null;
  campeonato: ICampeonato | null = null;
  hasStarted: boolean = false;

  // Mapeamento de nome de fase para ordem
  // Esta parte é importante para definir a ordem das fases do seu campeonato.
  // Adapte os nomes das fases para o seu campeonato (ex: 'Oitavas', 'Quartas', 'Semifinal', 'Final').
  // A Rodada 1 sempre será a fase de ordem 1.
  private phaseOrderMap: { [key: string]: number } = {
    'Rodada 1': 1,
    'Quartas de Final': 2,
    'Semifinal': 3,
    'Final': 4,
  };
  // Podemos ter um array de fases para facilitar a navegação em ordem
  private orderedPhases: string[] = Object.keys(this.phaseOrderMap).sort((a, b) => this.phaseOrderMap[a] - this.phaseOrderMap[b]);


  constructor(
    private modalCtrl: ModalController,
    private activatedRoute: ActivatedRoute,
    private timeService: TimeService,
    private matchService: MatchService, // Certifique-se de que está injetado
    private campeonatoService: CampeonatoService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async params => {
      this.campeonatoId = params.get('campeonatoId');
      if (this.campeonatoId) {
        console.log('ID do Campeonato:', this.campeonatoId);
        await this.loadCampeonatoData();
      } else {
        console.warn('Nenhum ID de campeonato fornecido na rota.');
        this.router.navigateByUrl('/campeonatos', { replaceUrl: true });
      }
    });
  }

  async loadCampeonatoData() {
    if (!this.campeonatoId) return;

    const loading = await this.loadingCtrl.create({
      message: 'Carregando dados do campeonato...',
    });
    await loading.present();

    try {
      this.campeonato = await this.campeonatoService.getCampeonatoById(this.campeonatoId);
      if (this.campeonato) {
        this.hasStarted = this.campeonato.status === 'em_andamento' || this.campeonato.status === 'finalizado';
        console.log('Campeonato carregado:', this.campeonato);
        await this.loadTimes();
      } else {
        console.error('Campeonato não encontrado.');
        const alert = await this.alertCtrl.create({
          header: 'Erro',
          message: 'Campeonato não encontrado.',
          buttons: ['OK'],
        });
        await alert.present();
        this.router.navigateByUrl('/campeonatos', { replaceUrl: true });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do campeonato:', error);
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível carregar os dados do campeonato.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      loading.dismiss();
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
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível carregar as equipes.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  getEquipeNomes(): string[] {
    return this.equipes.map(e => e.nome);
  }

  async adicionarEquipe() {
    if (this.hasStarted) {
      const alert = await this.alertCtrl.create({
        header: 'Atenção',
        message: 'Não é possível adicionar equipes após o campeonato ter sido iniciado.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }
    if (!this.campeonatoId) {
        console.error('Não é possível adicionar equipe: Campeonato ID não definido.');
        const alert = await this.alertCtrl.create({
            header: 'Erro',
            message: 'Não foi possível determinar o campeonato para adicionar a equipe.',
            buttons: ['OK'],
        });
        await alert.present();
        return;
    }

    const modal = await this.modalCtrl.create({
        component: AddTimeModalComponent,
        breakpoints: [0, 0.5, 0.8],
        initialBreakpoint: 0.5,
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm' && data?.nome) {
        const loading = await this.loadingCtrl.create({
            message: 'Salvando equipe...',
        });
        await loading.present();

        try {
            const id = await this.timeService.addTime(data, this.campeonatoId);
            console.log('Equipe salva no Firebase com ID:', id);

            const alert = await this.alertCtrl.create({
                header: 'Sucesso!',
                message: 'Equipe criada com sucesso!',
                buttons: ['OK'],
            });
            await alert.present();

        } catch (error) {
            console.error('Erro ao salvar equipe no Firebase:', error);
            const alert = await this.alertCtrl.create({
                header: 'Erro',
                message: 'Não foi possível salvar a equipe. Tente novamente.',
                buttons: ['OK'],
            });
            await alert.present();
        } finally {
            loading.dismiss();
        }
        await this.loadTimes();
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
        const alert = await this.alertCtrl.create({
          header: 'Erro',
          message: 'Fase atual não definida. Verifique o campeonato.',
          buttons: ['OK'],
        });
        await alert.present();
        this.router.navigateByUrl('/campeonatos', { replaceUrl: true });
      }
    } else {
      await this.startCampeonato();
    }
  }

  // 🔥 LÓGICA DE INICIAR CAMPEONATO E GERAR PRIMEIRA RODADA
  private async startCampeonato() {
    if (!this.campeonatoId) {
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'ID do campeonato não encontrado.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (this.equipes.length < 2) {
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'É necessário ter pelo menos 2 equipes para iniciar o campeonato.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Sorteando equipes e criando a tabela da Rodada 1...',
    });
    await loading.present();

    try {
      // 1. Embaralhar as equipes
      const shuffledTeams = [...this.equipes].sort(() => Math.random() - 0.5);
      console.log('Equipes embaralhadas para Rodada 1:', shuffledTeams.map(t => t.nome));

      const matchesCreated: IMatch[] = [];
      const numTeams = shuffledTeams.length;
      const initialPhaseName = this.orderedPhases[0]; // Pega o nome da primeira fase (ex: 'Rodada 1')
      const initialPhaseOrder = this.phaseOrderMap[initialPhaseName]; // Pega a ordem numérica

      // Lógica para lidar com Byes
      // Calcula o número de partidas que realmente ocorrerão (com 2 times)
      let numRealMatches = Math.floor(numTeams / 2);
      // Calcula o número de Byes (times que avançam direto)
      let numByes = numTeams % 2;

      // Separa os times que terão Byes (os últimos na lista embaralhada, por simplicidade)
      const teamsWithByes: ITime[] = [];
      for (let i = 0; i < numByes; i++) {
        teamsWithByes.push(shuffledTeams.pop()!); // .pop() remove do final e retorna o elemento
      }

      let partidaNaFaseCounter = 1; // Contador para a ordem das partidas na fase

      // 2. Criar partidas 1x1 para a primeira rodada
      for (let i = 0; i < numRealMatches; i++) {
        const timeA = shuffledTeams[i * 2]; // Pega o primeiro time do par
        const timeB = shuffledTeams[i * 2 + 1]; // Pega o segundo time do par

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

      // 3. Criar "partidas" de BYE (onde o time avança automaticamente)
      for (const teamBye of teamsWithByes) {
        const byeMatch: IMatch = {
          campeonatoId: this.campeonatoId,
          fase: initialPhaseName, // Ainda é da primeira fase
          ordemFase: initialPhaseOrder,
          partidaNaFase: partidaNaFaseCounter++, // Continua a ordem da partida
          timeAId: teamBye.id,
          timeANome: teamBye.nome,
          timeBId: null, // Indica que não tem adversário
          timeBNome: null,
          vencedorId: teamBye.id, // O próprio time já é o vencedor
          vencedorNome: teamBye.nome,
          placarTimeA: 0, // Pode ser 0 ou um valor indicativo de bye
          placarTimeB: 0,
        };
        const byeMatchId = await this.matchService.addMatch(byeMatch);
        matchesCreated.push({ ...byeMatch, id: byeMatchId });
      }


      // 4. Atualizar o campeonato no Firebase para indicar que ele foi iniciado
      await this.campeonatoService.updateCampeonato(this.campeonatoId, {
        faseAtual: initialPhaseName,
        status: 'em_andamento'
      });
      // Atualiza o objeto local 'campeonato' para que a tela reflita o estado imediatamente
      if (this.campeonato) {
        this.campeonato.faseAtual = initialPhaseName;
        this.campeonato.status = 'em_andamento';
      }
      this.hasStarted = true; // Atualiza a flag

      const alert = await this.alertCtrl.create({
        header: 'Sucesso!',
        message: `Campeonato iniciado! A ${initialPhaseName} foi criada.`,
        buttons: ['OK'],
      });
      await alert.present();

      // 5. Redireciona para a página da Rodada, passando a fase inicial
      this.router.navigate(['/rodada', this.campeonatoId, initialPhaseName]);

    } catch (error) {
      console.error('Erro ao iniciar campeonato ou criar tabela da Rodada 1:', error);
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Não foi possível iniciar o campeonato. Tente novamente.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      loading.dismiss();
    }
  }

  abrirEquipe(equipeNome: string) {
    console.log('Abrindo detalhes da equipe:', equipeNome);
  }
}