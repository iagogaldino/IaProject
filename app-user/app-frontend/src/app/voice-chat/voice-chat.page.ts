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
  documentTextOutline,
  imageOutline,
  libraryOutline,
  micOutline,
  send
} from 'ionicons/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ApiService } from '../services/api.service';
import { SavedMessagesService } from '../services/saved-messages.service';
import { TypingEffectService } from '../services/typing-effect.service';
import { MarkdownPipe } from '../pipes/markdown.pipe';
import { marked } from 'marked';

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
      documentTextOutline,
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

  async saveAndExportToPDF(message: ChatMessage): Promise<void> {
    if (message.sender !== 'assistant') {
      return;
    }

    // Primeiro, salva a mensagem (mantém funcionalidade original)
    this.saveMessage(message);

    try {
      // Encontra o elemento da mensagem no DOM
      const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
      
      if (!messageElement) {
        console.error('Elemento da mensagem não encontrado');
        return;
      }

      // Cria um elemento temporário para renderizar o conteúdo do PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.width = '210mm'; // A4 width
      pdfContainer.style.padding = '20mm';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.color = '#000000';

      // Adiciona o título
      const title = document.createElement('h1');
      title.textContent = 'Conect Juju - Informações';
      title.style.fontSize = '24px';
      title.style.marginBottom = '20px';
      title.style.color = '#0056A6';
      pdfContainer.appendChild(title);

      // Adiciona a pergunta do usuário (se disponível)
      const currentIndex = this.messages.indexOf(message);
      const userMessage = this.messages[currentIndex - 1];
      
      if (userMessage && userMessage.sender === 'user') {
        const questionDiv = document.createElement('div');
        questionDiv.style.marginBottom = '15px';
        questionDiv.style.padding = '10px';
        questionDiv.style.backgroundColor = '#f5f5f5';
        questionDiv.style.borderRadius = '5px';
        
        const questionLabel = document.createElement('strong');
        questionLabel.textContent = 'Pergunta: ';
        questionLabel.style.color = '#0056A6';
        questionDiv.appendChild(questionLabel);
        
        const questionText = document.createElement('span');
        questionText.textContent = userMessage.text;
        questionDiv.appendChild(questionText);
        
        pdfContainer.appendChild(questionDiv);
      }

      // Adiciona a resposta (conteúdo markdown convertido para HTML simples)
      const responseDiv = document.createElement('div');
      responseDiv.style.marginTop = '20px';
      responseDiv.style.lineHeight = '1.6';
      
      // Converte markdown para HTML simples
      const markdownText = message.text;
      const htmlContent = this.convertMarkdownToHTML(markdownText);
      responseDiv.innerHTML = htmlContent;
      
      pdfContainer.appendChild(responseDiv);

      // Adiciona data/hora
      const dateDiv = document.createElement('div');
      dateDiv.style.marginTop = '30px';
      dateDiv.style.paddingTop = '15px';
      dateDiv.style.borderTop = '1px solid #e0e0e0';
      dateDiv.style.fontSize = '12px';
      dateDiv.style.color = '#666666';
      dateDiv.textContent = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
      pdfContainer.appendChild(dateDiv);

      // Adiciona ao DOM temporariamente
      document.body.appendChild(pdfContainer);

      // Gera o canvas a partir do HTML
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Remove o elemento temporário
      document.body.removeChild(pdfContainer);

      // Cria o PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Adiciona a primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adiciona páginas adicionais se necessário
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Gera o nome do arquivo
      const fileName = `conect-juju-${new Date().getTime()}.pdf`;
      
      // Salva o PDF
      pdf.save(fileName);

      console.log('PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      // Em caso de erro, apenas salva a mensagem
    }
  }

  private convertMarkdownToHTML(markdown: string): string {
    // Configura o marked
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    // Usa a biblioteca marked para converter markdown para HTML
    const result = marked.parse(markdown);
    let html = typeof result === 'string' ? result : String(result);
    
    // Adiciona estilos aos elementos HTML gerados
    html = html
      // Estiliza títulos
      .replace(/<h1>/gim, '<h1 style="font-size: 20px; color: #0056A6; margin-top: 15px; margin-bottom: 10px; font-weight: bold;">')
      .replace(/<h2>/gim, '<h2 style="font-size: 18px; color: #0056A6; margin-top: 12px; margin-bottom: 8px; font-weight: bold;">')
      .replace(/<h3>/gim, '<h3 style="font-size: 16px; color: #0056A6; margin-top: 10px; margin-bottom: 6px; font-weight: bold;">')
      // Estiliza parágrafos
      .replace(/<p>/gim, '<p style="margin: 8px 0; line-height: 1.6;">')
      // Estiliza listas
      .replace(/<ul>/gim, '<ul style="margin: 10px 0; padding-left: 20px;">')
      .replace(/<ol>/gim, '<ol style="margin: 10px 0; padding-left: 20px;">')
      .replace(/<li>/gim, '<li style="margin-bottom: 5px;">')
      // Estiliza negrito
      .replace(/<strong>/gim, '<strong style="font-weight: bold; color: #0056A6;">')
      // Estiliza código
      .replace(/<code>/gim, '<code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace;">');

    return html;
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

    console.log('🟡 VoiceChat - sendMessage chamado');

    const control = this.form.get('message');
    const text = (control?.value || '').toString().trim();

    console.log('🟡 VoiceChat - Text:', text);
    console.log('🟡 VoiceChat - selectedImage:', this.selectedImage);

    if (!text && !this.selectedImage) {
      console.log('🟡 VoiceChat - Retornando: sem texto e sem imagem');
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

    console.log('🟢 VoiceChat - Chamando apiService.askQuestion');
    console.log('🟢 VoiceChat - Prompt:', prompt);
    console.log('🟢 VoiceChat - History:', history);

    this.apiService.askQuestion(prompt, history).subscribe({
      next: (response) => {
        console.log('🟢 VoiceChat - Resposta recebida:', response);
        this.handleAiResponse(response.data, assistantMessageIndex);
      },
      error: (error) => {
        console.error('🔴 VoiceChat - Erro na requisição:', error);
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
