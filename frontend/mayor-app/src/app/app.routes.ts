import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'voice-chat',
    pathMatch: 'full',
  },
  {
    path: 'voice-chat',
    loadComponent: () => import('./voice-chat/voice-chat.page').then( m => m.VoiceChatPage)
  },
];
