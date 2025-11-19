import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConversationService, ConversationMessage } from '../../services/conversation.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-conversation-history',
  templateUrl: './conversation-history.component.html',
  styleUrls: ['./conversation-history.component.scss'],
  standalone: true,
  imports: [CommonModule, MarkdownPipe]
})
export class ConversationHistoryComponent implements OnInit, OnDestroy {
  conversationHistory: ConversationMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private conversationService: ConversationService) {}

  ngOnInit() {
    // Subscrever ao hist├│rico de conversa
    this.subscription.add(
      this.conversationService.conversationHistory$.subscribe(history => {
        this.conversationHistory = history;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Formata timestamp para exibi├º├úo
   */
  formatTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Verifica se a mensagem ├⌐ do usu├írio
   */
  isUserMessage(message: ConversationMessage): boolean {
    return message.sender === 'user';
  }

  /**
   * Verifica se a mensagem ├⌐ da IA
   */
  isAssistantMessage(message: ConversationMessage): boolean {
    return message.sender === 'assistant';
  }

  /**
   * Limpa o hist├│rico da conversa
   */
  clearHistory() {
    this.conversationService.clearConversationHistory().subscribe({
      next: () => {
        console.log('Hist├│rico limpo com sucesso');
      },
      error: (error) => {
        console.error('Erro ao limpar hist├│rico:', error);
      }
    });
  }

  /**
   * Inicia uma nova conversa
   */
  startNewConversation() {
    this.conversationService.startNewConversation();
  }

  /**
   * Obt├⌐m estat├¡sticas da conversa
   */
  getConversationStats() {
    this.conversationService.getConversationStats().subscribe({
      next: (stats) => {
        console.log('Estat├¡sticas da conversa:', stats);
        // Aqui voc├¬ pode exibir as estat├¡sticas em um modal ou toast
      },
      error: (error) => {
        console.error('Erro ao obter estat├¡sticas:', error);
      }
    });
  }

  /**
   * Busca mensagens na conversa
   */
  searchMessages(searchTerm: string) {
    if (!searchTerm.trim()) return;

    this.conversationService.searchMessages(searchTerm).subscribe({
      next: (results) => {
        console.log('Resultados da busca:', results);
        // Aqui voc├¬ pode exibir os resultados em um modal ou destacar na lista
      },
      error: (error) => {
        console.error('Erro na busca:', error);
      }
    });
  }

  /**
   * Obt├⌐m resumo da conversa
   */
  getConversationSummary() {
    this.conversationService.getConversationSummary().subscribe({
      next: (summary) => {
        console.log('Resumo da conversa:', summary);
        // Aqui voc├¬ pode exibir o resumo em um modal
      },
      error: (error) => {
        console.error('Erro ao obter resumo:', error);
      }
    });
  }
}
