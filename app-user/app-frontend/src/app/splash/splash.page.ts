import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  imports: [IonContent, IonButton],
  standalone: true
})
export class SplashPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // Usu├írio deve clicar no bot├úo para prosseguir
  }

  goToHome() {
    this.router.navigate(['/voice-chat']);
  }

}
