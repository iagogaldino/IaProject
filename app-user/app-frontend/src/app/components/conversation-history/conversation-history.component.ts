import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { ConversationMessage, ConversationService } from '../../services/conversation.service';

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
    // Subscrever ao histórico de conversa
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
   * Formata timestamp para exibição
   */
  formatTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Verifica se a mensagem é do usuário
   */
  isUserMessage(message: ConversationMessage): boolean {
    return message.sender === 'user';
  }

  /**
   * Verifica se a mensagem é da IA
   */
  isAssistantMessage(message: ConversationMessage): boolean {
    return message.sender === 'assistant';
  }

  /**
   * Limpa o histórico da conversa
   */
  clearHistory() {
    this.conversationService.clearConversationHistory().subscribe({
      next: () => {
        console.log('Histórico limpo com sucesso');
      },
      error: (error) => {
        console.error('Erro ao limpar histórico:', error);
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
   * Obtém estatísticas da conversa
   */
  getConversationStats() {
    this.conversationService.getConversationStats().subscribe({
      next: (stats) => {
        console.log('Estatísticas da conversa:', stats);
        // Aqui você pode exibir as estatísticas em um modal ou toast
      },
      error: (error) => {
        console.error('Erro ao obter estatísticas:', error);
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
        // Aqui você pode exibir os resultados em um modal ou destacar na lista
      },
      error: (error) => {
        console.error('Erro na busca:', error);
      }
    });
  }

  /**
   * Obtém resumo da conversa
   */
  getConversationSummary() {
    this.conversationService.getConversationSummary().subscribe({
      next: (summary) => {
        console.log('Resumo da conversa:', summary);
        // Aqui você pode exibir o resumo em um modal
      },
      error: (error) => {
        console.error('Erro ao obter resumo:', error);
      }
    });
  }
}
