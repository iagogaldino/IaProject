import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonInput, IonChip, IonLabel } from '@ionic/angular/standalone';
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
  documentTextOutline
} from 'ionicons/icons';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-voice-chat',
  templateUrl: './voice-chat.page.html',
  styleUrls: ['./voice-chat.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonButtons, IonIcon, IonInput, IonChip, IonLabel, CommonModule, FormsModule,
    FormsModule, ReactiveFormsModule

  ]
})
export class VoiceChatPage implements OnInit {

  form!: FormGroup;
  isTyping = false;

  messages: { text: string; sender: 'user' | 'ai' | 'error', hour: string }[] = [
    // { text: 'Hello! How can I assist you today?', sender: 'ai', hour: '10:00 AM' },
    // { text: 'Can you tell me a joke?', sender: 'user', hour: '10:01 AM' },
    // { text: 'Sure! Why did the scarecrow win an award? Because he was outstanding in his field!', sender: 'ai', hour: '10:02 AM' }
  ];

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    addIcons({
      chatbubblesOutline,
      sparkles,
      person,
      attachOutline,
      micOutline,
      send,
      helpCircleOutline,
      bulbOutline,
      documentTextOutline
    });
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
      message: ['']
    });
  }

  sendMessage() {
    const message = this.form.get('message')?.value;
    if (message) {
      const currentHour = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.messages.push({ text: message, sender: 'user', hour: currentHour });
      this.form.reset();

      setTimeout(() => {
        this.isTyping = true;
      }, 1000);

      // Call the API service
      this.apiService.askQuestion(message).subscribe({
        next: (response) => {
          const aiResponse = {
            id: Date.now() + 1,
            content: response.data, // Assuming the API returns { answer: '...' }
            sender: 'ai',
            timestamp: new Date()
          };
          this.messages.push({
            text: response.data,
            sender: 'ai',
            hour: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        },
        error: (error) => {
          console.error('Error from API:', error);
          this.isTyping = false;

          this.messages.push({
            text: error.message || 'An error occurred while fetching the response.',
            sender: 'error',
            hour: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        },
        complete: () => {
          this.isTyping = false;
        }
      });
    }
  }

}
