import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'folder/:id',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'campeonatos',
    loadComponent: () => import('./campeonatos/campeonatos.page').then( m => m.CampeonatosPage)
  },
  {
    path: 'times',
    loadComponent: () => import('./times/times.page').then( m => m.TimesPage)
  },
  {
    path: 'rodada',
    loadComponent: () => import('./rodada/rodada.page').then( m => m.RodadaPage)
  },
];
