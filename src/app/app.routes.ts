import { Routes } from '@angular/router';
import { authGuard, loginGate } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'login',
    canActivate: [loginGate],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  { path: 'home', canActivate: [authGuard], loadComponent: () => import('./features/home/home').then((m) => m.Home) },
  { path: 'search', canActivate: [authGuard], loadComponent: () => import('./features/search/search').then((m) => m.SearchPage) },
  { path: 'artist/:id', canActivate: [authGuard], loadComponent: () => import('./features/artist/artist').then((m) => m.ArtistPage) },
  { path: 'album/:id', canActivate: [authGuard], loadComponent: () => import('./features/album/album').then((m) => m.AlbumPage) },
  { path: 'show/:id', canActivate: [authGuard], loadComponent: () => import('./features/show/show').then((m) => m.ShowPage) },
  { path: 'audiobook/:id', canActivate: [authGuard], loadComponent: () => import('./features/audiobook/audiobook').then((m) => m.AudiobookPage) },
  { path: 'lab', canActivate: [authGuard], loadComponent: () => import('./features/lab/lab').then((m) => m.Lab) },
  // Design system kit: public so it can be reviewed without logging in.
  { path: 'kit', loadComponent: () => import('./features/kit/kit').then((m) => m.Kit) },
  { path: '**', redirectTo: 'home' },
];
