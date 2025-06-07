import { Routes, PreloadAllModules, RouterModule } from '@angular/router';
import { redirectUnauthorizedTo, redirectLoggedInTo, canActivate } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToCampeonatos = () => redirectLoggedInTo(['campeonatos']);

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage),
    ...canActivate(redirectLoggedInToCampeonatos)
  },
  {
    path: 'campeonatos',
    loadComponent: () => import('./campeonatos/campeonatos.page').then( m => m.CampeonatosPage),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'times/:campeonatoId', // Rota com parâmetro
    loadComponent: () => import('./times/times.page').then( m => m.TimesPage),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'rodada',
    loadComponent: () => import('./rodada/rodada.page').then( m => m.RodadaPage)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];