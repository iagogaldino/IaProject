import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  bookmarkOutline,
  close,
  imageOutline,
  libraryOutline,
  micOutline,
  send
} from 'ionicons/icons';
import { ApiService } from '../services/api.service';
import { SavedMessagesService } from '../services/saved-messages.service';
import { TypingEffectService } from '../services/typing-effect.service';
import { MarkdownPipe } from '../pipes/markdown.pipe';

interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

type Sender = 'user' | 'assistant' | 'error';

interface ChatMessage {
  id: number;
  text: string;
  sender: Sender;
  hour: string;
  image?: string;
  isTyping?: boolean;
}

@Component({
  selector: 'app-voice-chat',
  templateUrl: './voice-chat.page.html',
  styleUrls: ['./voice-chat.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MarkdownPipe
  ]
})
export class VoiceChatPage implements OnInit, AfterViewInit {
  @ViewChild(IonContent, { static: false }) content?: IonContent;
  @ViewChild('messageInput', { static: false }) messageInput?: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput', { static: false }) imageInput?: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  messages: ChatMessage[] = [];
  selectedImage: string | null = null;
  recognition: any = null;
  transcript = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private savedMessagesService: SavedMessagesService,
    private typingEffectService: TypingEffectService,
    private router: Router
  ) {
    addIcons({
      bookmarkOutline,
      close,
      imageOutline,
      libraryOutline,
      micOutline,
      send
    });

    this.setupSpeechRecognition();
  }

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      message: ['']
    });
    
    // Mock de mensagens para simular uma conversa longa
    this.loadMockMessages();
  }

  ngAfterViewInit(): void {
    // Aguarda o view estar totalmente inicializado antes de fazer scroll
    if (this.messages.length > 0) {
      // Usa um delay maior para garantir que o ion-content esteja totalmente renderizado
      setTimeout(() => {
        this.scrollToBottom();
      }, 500);
    }
  }

  private loadMockMessages(): void {
    const mockMessages: ChatMessage[] = [
      {
        id: 1,
        text: 'Olá! Como posso ajudar você hoje?',
        sender: 'assistant',
        hour: '08:30'
      },
      {
        id: 2,
        text: 'Gostaria de saber sobre as obras em Petrolina',
        sender: 'user',
        hour: '08:31'
      },
      {
        id: 3,
        text: 'Claro! Posso te ajudar com informações sobre obras em Petrolina. Sobre qual tipo de obra você gostaria de saber?',
        sender: 'assistant',
        hour: '08:31'
      },
      {
        id: 4,
        text: 'Quero saber sobre pavimentação de ruas',
        sender: 'user',
        hour: '08:32'
      },
      {
        id: 5,
        text: 'A pavimentação de ruas em Petrolina é uma prioridade da administração municipal. Existem vários projetos em andamento para melhorar a infraestrutura viária da cidade.',
        sender: 'assistant',
        hour: '08:32'
      },
      {
        id: 6,
        text: 'Quais são os bairros que estão sendo pavimentados?',
        sender: 'user',
        hour: '08:33'
      },
      {
        id: 7,
        text: 'Atualmente, os trabalhos de pavimentação estão concentrados em vários bairros, incluindo áreas do centro e da periferia. Para informações específicas sobre seu bairro, recomendo consultar a Prefeitura de Petrolina.',
        sender: 'assistant',
        hour: '08:33'
      },
      {
        id: 8,
        text: 'E quanto ao investimento? Quanto está sendo gasto?',
        sender: 'user',
        hour: '08:34'
      },
      {
        id: 9,
        text: 'Os investimentos em obras de Petrolina variam de acordo com o tipo, porte e número de projetos executados. Para obter valores exatos e atualizados, recomendo consultar relatórios oficiais da Prefeitura ou portais da transparência.',
        sender: 'assistant',
        hour: '08:34'
      },
      {
        id: 10,
        text: 'Obrigado pelas informações!',
        sender: 'user',
        hour: '08:35'
      },
      {
        id: 11,
        text: 'De nada! Estou sempre à disposição para ajudar. Se tiver mais dúvidas sobre obras ou pavimentação, é só perguntar!',
        sender: 'assistant',
        hour: '08:35'
      }
    ];

    this.messages = mockMessages;
  }

  get isChatEmpty(): boolean {
    return this.messages.length === 0;
  }

  get canSendMessage(): boolean {
    const control = this.form?.get('message');
    const text = (control?.value || '').toString().trim();
    return !!text || !!this.selectedImage;
  }

  goToSavedMessages(): void {
    this.router.navigate(['/saved-messages']);
  }

  openImageSelector(): void {
    this.imageInput?.nativeElement.click();
  }

  selectImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage = null;
    this.resetFileInput();
  }

  startListening(): void {
    if (!this.recognition) {
      return;
    }

    this.transcript = 'Ouvindo...';
    this.recognition.start();
  }

  saveMessage(message: ChatMessage): void {
    if (message.sender !== 'assistant') {
      return;
    }

    const currentIndex = this.messages.indexOf(message);
    const userMessage = this.messages[currentIndex - 1];

    if (userMessage && userMessage.sender === 'user') {
      this.savedMessagesService.saveMessage(userMessage.text, message.text);
    }
  }

  private setupSpeechRecognition(): void {
    const win = window as unknown as Window;
    const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      this.recognition = null;
      return;
    }

    this.recognition = new SpeechRecognitionConstructor();
    this.recognition.lang = 'pt-BR';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.addEventListener('result', (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.transcript = transcript;
      this.form.patchValue({ message: transcript });
      this.sendMessage();
    });

    this.recognition.addEventListener('speechend', () => {
      this.recognition?.stop();
    });

    this.recognition.addEventListener('error', (event: any) => {
      this.transcript = `Erro no reconhecimento de voz: ${event.error}`;
    });
  }

  sendMessage(event?: Event): void {
    event?.preventDefault();

    const control = this.form.get('message');
    const text = (control?.value || '').toString().trim();

    if (!text && !this.selectedImage) {
      return;
    }

    const hour = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: ChatMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      hour,
      image: this.selectedImage || undefined
    };

    this.messages = [...this.messages, newMessage];
    this.form.reset({ message: '' });
    this.selectedImage = null;
    this.resetFileInput();
    this.focusMessageInput();
    this.scrollToBottom();

    // Cria a mensagem do assistente com indicador de typing ANTES de receber a resposta
    const assistantMessageIndex = this.messages.length;
    this.messages.push({
      id: Date.now() + 1,
      text: '',
      sender: 'assistant',
      hour: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTyping: true
    });
    this.scrollToBottom();

    const prompt = text || '[Imagem enviada]';
    const history = this.messages.slice(-10);

    this.apiService.askQuestion(prompt, history).subscribe({
      next: (response) => this.handleAiResponse(response.data, assistantMessageIndex),
      error: (error) => {
        // Remove o indicador de typing em caso de erro
        const message = this.messages[assistantMessageIndex];
        if (message) {
          message.isTyping = false;
        }
        this.handleError(error);
      }
    });
  }

  private handleAiResponse(content: string, messageIndex: number): void {
    const message = this.messages[messageIndex];
    if (!message) {
      return;
    }

    let isFirstCharacter = true;

    // O indicador de typing já está ativo desde que a mensagem foi enviada
    // Agora apenas processa o texto recebido
    this.typingEffectService.typeTextWithCallback(
      content,
      (partialText: string) => {
        const message = this.messages[messageIndex];
        if (message) {
          // Desativa o indicador de typing assim que começar a receber o texto
          if (isFirstCharacter && partialText.length > 0) {
            message.isTyping = false;
            isFirstCharacter = false;
          }
          message.text = partialText;
          this.scrollToBottom();
        }
      },
      15,
      () => {
        // Garante que o indicador está desativado ao finalizar
        const message = this.messages[messageIndex];
        if (message) {
          message.isTyping = false;
        }
        this.scrollToBottom();
      }
    );
  }

  private handleError(error: any): void {
    this.messages.push({
      id: Date.now() + 2,
      text: error?.message || 'Ocorreu um erro ao obter a resposta.',
      sender: 'error',
      hour: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.scrollToBottom();
  }

  private resetFileInput(): void {
    if (this.imageInput?.nativeElement) {
      this.imageInput.nativeElement.value = '';
    }
  }

  private focusMessageInput(): void {
    requestAnimationFrame(() => this.messageInput?.nativeElement.focus());
  }

  private scrollToBottom(): void {
    if (!this.content) {
      return;
    }

    // Verifica se o conteúdo está disponível antes de fazer scroll
    try {
      // Usa múltiplos requestAnimationFrame para garantir que o DOM esteja pronto
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this.content) {
            try {
              this.content.scrollToBottom(200);
            } catch (error) {
              // Ignora erros se o conteúdo ainda não estiver totalmente inicializado
              console.debug('Scroll não disponível ainda:', error);
            }
          }
        });
      });
    } catch (error) {
      // Ignora erros se o conteúdo ainda não estiver pronto
      console.debug('Scroll não disponível ainda:', error);
    }
  }
}
