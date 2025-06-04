import { Routes, PreloadAllModules, RouterModule } from '@angular/router';
import { redirectUnauthorizedTo, redirectLoggedInTo, canActivate } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToCampeonatos = () => redirectLoggedInTo(['campeonatos']); // Não usaremos este neste cenário, mas mantive para referência.

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login', // Redireciona para login se o caminho for vazio
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage),
    ...canActivate(redirectLoggedInToCampeonatos) // Se já logado, redireciona para campeonatos
  },
  {
    path: 'campeonatos',
    loadComponent: () => import('./campeonatos/campeonatos.page').then( m => m.CampeonatosPage),
    ...canActivate(redirectUnauthorizedToLogin) // Requer autenticação
  },
  {
    path: 'times',
    loadComponent: () => import('./times/times.page').then( m => m.TimesPage),
    ...canActivate(redirectUnauthorizedToLogin) // Requer autenticação
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