import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonInput, IonLabel } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chatbubblesOutline,
  sparkles,
  person,
  attachOutline,
  micOutline,
  send,
  helpCircleOutline,
  bulbOutline,
  documentTextOutline,
  constructOutline,
  bookmarkOutline,
  libraryOutline,
  imageOutline,
  close
} from 'ionicons/icons';
import { ApiService } from '../services/api.service';
import { SavedMessagesService } from '../services/saved-messages.service';
import { delay, tap } from 'rxjs';

interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

@Component({
  selector: 'app-voice-chat',
  templateUrl: './voice-chat.page.html',
  styleUrls: ['./voice-chat.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonButtons, IonIcon, IonInput, CommonModule, FormsModule,
    ReactiveFormsModule
  ]
})
export class VoiceChatPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content!: IonContent;
  
  form!: FormGroup;
  isTyping = false;
  selectedImage: string | null = null;
  @ViewChild('imageUpload', { static: false }) imageUpload!: any;

  get isChatEmpty(): boolean {
    return this.messages.length === 0;
  }

  messages: { text: string; sender: 'user' | 'assistant' | 'error', hour: string, image?: string }[] = [
    // { text: 'Hello! How can I assist you today?', sender: 'assistant', hour: '10:00 AM' },
    // { text: 'Can you tell me a joke?', sender: 'user', hour: '10:01 AM' },
    // { text: 'Sure! Why did the scarecrow win an award? Because he was outstanding in his field!', sender: 'assistant', hour: '10:02 AM' }
  ];

  transcript = '';
  response = '';
  recognition: any;

  constructor(
    private fb: FormBuilder, 
    private apiService: ApiService,
    private savedMessagesService: SavedMessagesService,
    private router: Router
  ) {
    addIcons({
      chatbubblesOutline,
      sparkles,
      person,
      attachOutline,
      micOutline,
      send,
      helpCircleOutline,
      bulbOutline,
      documentTextOutline,
      constructOutline,
      bookmarkOutline,
      libraryOutline,
      imageOutline,
      close
    });

    const { webkitSpeechRecognition }: any = window as any;
    this.recognition = new ((window as any).SpeechRecognition || webkitSpeechRecognition)();
    this.recognition.lang = 'pt-BR';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.addEventListener('result', (event: any) => {
      this.transcript = event.results[0][0].transcript;
      this.enviarParaIA(this.transcript);
    });

    this.recognition.addEventListener('speechend', () => {
      this.recognition.stop();
    });

    this.recognition.addEventListener('error', (event: any) => {
      this.transcript = 'Erro no reconhecimento de voz: ' + event.error;
    });
  }

  ngOnInit() {
    this.initForm();
  }


  private scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }

  saveMessage(message: { text: string; sender: 'user' | 'assistant' | 'error', hour: string, image?: string }) {
    if (message.sender === 'assistant') {
      // Encontrar a pergunta do usuário correspondente
      const userMessage = this.messages[this.messages.indexOf(message) - 1];
      if (userMessage && userMessage.sender === 'user') {
        const messageId = this.savedMessagesService.saveMessage(userMessage.text, message.text);
        console.log('Mensagem salva com ID:', messageId);
      }
    }
  }

  selectImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImage = null;
  }

  openImageSelector() {
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  goToSavedMessages() {
    this.router.navigate(['/saved-messages']);
  }

  startListening() {
    this.transcript = '🎙️ Ouvindo...';
    this.response = '';
    this.recognition.start();
  }

  enviarParaIA(text: string) {
    console.log('Texto reconhecido:', text);
    this.form.get('message')?.setValue( text );
    this.sendMessage();
  }

  initForm() {
    this.form = this.fb.group({
      message: ['']
    });
  }

  sendMessage() {
    const message = this.form.get('message')?.value;
    if (message || this.selectedImage) {
      const currentHour = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.messages.push({ 
        text: message || '', 
        sender: 'user', 
        hour: currentHour,
        image: this.selectedImage || undefined
      });
      this.form.reset();
      this.selectedImage = null;
      this.scrollToBottom();

      // Enviar histórico da conversa para manter contexto
      const conversationHistory = this.messages.slice(-10); // Últimas 10 mensagens para contexto
      
      this.apiService.askQuestion(message, conversationHistory)
      .pipe(
        tap(() => this.isTyping = true),
        delay(2000)
      )
      .subscribe({
        next: (response) => {
          const aiResponse = {
            id: Date.now() + 1,
            content: response.data,
            sender: 'assistant',
            timestamp: new Date()
          };
          this.messages.push({
            text: response.data,
            sender: 'assistant',
            hour: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error from API:', error);
          this.isTyping = false;

          this.messages.push({
            text: error.message || 'An error occurred while fetching the response.',
            sender: 'error',
            hour: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          this.scrollToBottom();
        },
        complete: () => {
          this.isTyping = false;
        }
      });
    }
  }

}
