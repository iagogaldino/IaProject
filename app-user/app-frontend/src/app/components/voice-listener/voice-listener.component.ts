
import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { micOutline, stop, pulse } from 'ionicons/icons';

@Component({
  selector: 'app-voice-listener',
  templateUrl: './voice-listener.component.html',
  styleUrls: ['./voice-listener.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton]
})
export class VoiceListenerComponent implements OnInit, OnDestroy {
  @Output() voiceRecorded = new EventEmitter<Blob>();
  @Output() listeningStateChange = new EventEmitter<boolean>();

  isListening: boolean = false;
  audioLevels: number[] = [0, 0, 0, 0, 0];
  animationInterval: any;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];

  constructor() {
    addIcons({ micOutline, stop, pulse });
  }

  ngOnInit() {
    // Component is now self-contained
  }

  ngOnDestroy() {
    this.stopAudioAnimation();
    this.stopVoiceRecording();
  }

  async toggleListening() {
    if (this.isListening) {
      this.stopVoiceRecording();
    } else {
      await this.startVoiceRecording();
    }
  }

  private async startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isListening = true;
      this.listeningStateChange.emit(true);

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.voiceRecorded.emit(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.startAudioAnimation();
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('N├úo foi poss├¡vel acessar o microfone. Verifique as permiss├╡es.');
      this.isListening = false;
      this.listeningStateChange.emit(false);
    }
  }

  private stopVoiceRecording() {
    if (this.mediaRecorder && this.isListening) {
      this.mediaRecorder.stop();
      this.isListening = false;
      this.listeningStateChange.emit(false);
      this.stopAudioAnimation();
    }
  }

  private startAudioAnimation() {
    this.stopAudioAnimation(); // Limpa qualquer anima├º├úo anterior
    
    this.animationInterval = setInterval(() => {
      // Simula n├¡veis de ├íudio aleat├│rios mais realistas
      this.audioLevels = this.audioLevels.map(() => 
        Math.random() * 80 + 20 // Entre 20 e 100 para parecer mais natural
      );
    }, 150);
  }

  private stopAudioAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    // Reset n├¡veis de ├íudio
    this.audioLevels = [0, 0, 0, 0, 0];
  }
}
