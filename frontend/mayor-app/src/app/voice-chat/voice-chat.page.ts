import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-voice-chat',
  templateUrl: './voice-chat.page.html',
  styleUrls: ['./voice-chat.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class VoiceChatPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
