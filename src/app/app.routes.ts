import { Routes, PreloadAllModules, RouterModule } from '@angular/router';
import { redirectUnauthorizedTo, redirectLoggedInTo, canActivate } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToCampeonatos = () => redirectLoggedInTo(['campeonatos']);

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
    path: 'times/:campeonatoId',
    loadComponent: () => import('./times/times.page').then( m => m.TimesPage),
    ...canActivate(redirectUnauthorizedToLogin) // Requer autenticação
  },
  {
    path: 'rodada/:campeonatoId/:fase', // Rota para o dono e usuários logados
    loadComponent: () => import('./rodada/rodada.page').then( m => m.RodadaPage),
    ...canActivate(redirectUnauthorizedToLogin) // Requer autenticação para acesso normal
  },
  {
    path: 'publico/:codigoAcessoPublico', // 🔥 NOVA ROTA PARA ACESSO PÚBLICO
    loadComponent: () => import('./rodada/rodada.page').then( m => m.RodadaPage)
    // ATENÇÃO: Para esta rota, não adicionamos o canActivate(redirectUnauthorizedToLogin)
    // Isso permite que usuários não logados acessem esta página.
    // As regras de segurança do Firebase (passo 11) e a lógica na RodadaPage (passo 12)
    // controlarão as permissões de leitura/escrita.
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];