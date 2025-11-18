import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { TypingEffectService } from '../services/typing-effect.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  imports: [IonContent, IonButton, CommonModule],
  standalone: true
})
export class SplashPage implements OnInit {

  mensagemCompleta = 'Olá, meu prefeito! Seja muito bem-vindo ao CONECTLINA. Eu sou a Lina e estou aqui para facilitar sua vida, tirando todas as suas dúvidas sobre a sua gestão. Como posso ajudá-lo hoje?';
  mensagemExibida = '';

  constructor(
    private router: Router,
    private typingEffectService: TypingEffectService
  ) { }

  ngOnInit() {
    // Aplicar efeito de digitação quando a página carregar
    this.typingEffectService.typeTextWithCallback(
      this.mensagemCompleta,
      (texto) => {
        this.mensagemExibida = texto;
      },
      30 // Velocidade de 30ms por caractere
    );
  }

  goToHome() {
    this.router.navigate(['/voice-chat']);
  }

}
