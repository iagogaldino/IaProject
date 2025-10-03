import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'splash',
    loadComponent: () => import('./splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'voice-chat',
    loadComponent: () => import('./voice-chat/voice-chat.page').then( m => m.VoiceChatPage)
  },
  {
    path: 'voice-listener',
    loadComponent: () => import('./components/voice-listener/voice-listener.component').then( m => m.VoiceListenerComponent)
  },
  {
    path: 'saved-messages',
    loadComponent: () => import('./saved-messages/saved-messages.page').then( m => m.SavedMessagesPage)
  },
  {
    path: 'message-detail/:id',
    loadComponent: () => import('./message-detail/message-detail.page').then( m => m.MessageDetailPage)
  },
];
