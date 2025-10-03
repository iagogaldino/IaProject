import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SavedMessage {
  id: string;
  title: string;
  content: string;
  userQuestion: string;
  aiResponse: string;
  timestamp: Date;
  category?: string;
  tags: string[];
  isFavorite: boolean;
  summary: string;
}

@Injectable({
  providedIn: 'root'
})
export class SavedMessagesService {
  private savedMessagesSubject = new BehaviorSubject<SavedMessage[]>([]);
  public savedMessages$ = this.savedMessagesSubject.asObservable();

  private readonly STORAGE_KEY = 'saved_messages';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const messages = JSON.parse(stored).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        this.savedMessagesSubject.next(messages);
      }
    } catch (error) {
      console.error('Error loading saved messages:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.savedMessagesSubject.value));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  saveMessage(userQuestion: string, aiResponse: string): string {
    const id = this.generateId();
    const summary = this.generateSummary(aiResponse);
    const title = this.generateTitle(userQuestion);
    
    const newMessage: SavedMessage = {
      id,
      title,
      content: aiResponse,
      userQuestion,
      aiResponse,
      timestamp: new Date(),
      category: this.categorizeMessage(userQuestion, aiResponse),
      tags: this.extractTags(userQuestion, aiResponse),
      isFavorite: false,
      summary
    };

    const currentMessages = this.savedMessagesSubject.value;
    const updatedMessages = [newMessage, ...currentMessages];
    this.savedMessagesSubject.next(updatedMessages);
    this.saveToStorage();

    return id;
  }

  getMessageById(id: string): SavedMessage | undefined {
    return this.savedMessagesSubject.value.find(msg => msg.id === id);
  }

  updateMessage(id: string, updates: Partial<SavedMessage>): boolean {
    const messages = this.savedMessagesSubject.value;
    const index = messages.findIndex(msg => msg.id === id);
    
    if (index !== -1) {
      messages[index] = { ...messages[index], ...updates };
      this.savedMessagesSubject.next([...messages]);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  deleteMessage(id: string): boolean {
    const messages = this.savedMessagesSubject.value;
    const filteredMessages = messages.filter(msg => msg.id !== id);
    
    if (filteredMessages.length !== messages.length) {
      this.savedMessagesSubject.next(filteredMessages);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  toggleFavorite(id: string): boolean {
    const message = this.getMessageById(id);
    if (message) {
      return this.updateMessage(id, { isFavorite: !message.isFavorite });
    }
    return false;
  }

  searchMessages(query: string): SavedMessage[] {
    const messages = this.savedMessagesSubject.value;
    const lowercaseQuery = query.toLowerCase();
    
    return messages.filter(msg => 
      msg.title.toLowerCase().includes(lowercaseQuery) ||
      msg.content.toLowerCase().includes(lowercaseQuery) ||
      msg.userQuestion.toLowerCase().includes(lowercaseQuery) ||
      msg.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  getMessagesByCategory(category: string): SavedMessage[] {
    return this.savedMessagesSubject.value.filter(msg => msg.category === category);
  }

  getFavoriteMessages(): SavedMessage[] {
    return this.savedMessagesSubject.value.filter(msg => msg.isFavorite);
  }

  getRecentMessages(limit: number = 10): SavedMessage[] {
    return this.savedMessagesSubject.value
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  exportMessages(format: 'json' | 'txt' | 'csv'): string {
    const messages = this.savedMessagesSubject.value;
    
    switch (format) {
      case 'json':
        return JSON.stringify(messages, null, 2);
      
      case 'txt':
        return messages.map(msg => 
          `=== ${msg.title} ===\n` +
          `Data: ${msg.timestamp.toLocaleString()}\n` +
          `Pergunta: ${msg.userQuestion}\n` +
          `Resposta: ${msg.aiResponse}\n` +
          `Categoria: ${msg.category || 'N/A'}\n` +
          `Tags: ${msg.tags.join(', ')}\n` +
          `---\n`
        ).join('\n');
      
      case 'csv':
        const headers = ['T├¡tulo', 'Data', 'Pergunta', 'Resposta', 'Categoria', 'Tags'];
        const rows = messages.map(msg => [
          msg.title,
          msg.timestamp.toLocaleString(),
          `"${msg.userQuestion}"`,
          `"${msg.aiResponse}"`,
          msg.category || '',
          msg.tags.join(';')
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
      
      default:
        return '';
    }
  }

  getCategories(): string[] {
    const categories = this.savedMessagesSubject.value
      .map(msg => msg.category)
      .filter((cat, index, arr) => cat && arr.indexOf(cat) === index) as string[];
    return categories.sort();
  }

  getTags(): string[] {
    const allTags: string[] = [];
    this.savedMessagesSubject.value.forEach(msg => {
      allTags.push(...msg.tags);
    });
    return [...new Set(allTags)].sort();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateTitle(question: string): string {
    const words = question.split(' ').slice(0, 6);
    return words.join(' ') + (question.split(' ').length > 6 ? '...' : '');
  }

  private generateSummary(content: string): string {
    const words = content.split(' ').slice(0, 20);
    return words.join(' ') + (content.split(' ').length > 20 ? '...' : '');
  }

  private categorizeMessage(question: string, response: string): string {
    const text = (question + ' ' + response).toLowerCase();
    
    if (text.includes('relat├│rio') || text.includes('dados') || text.includes('estat├¡stica')) {
      return 'Geral';
    } else if (text.includes('or├ºamento') || text.includes('financeiro') || text.includes('custo')) {
      return 'Financeiro';
    } else if (text.includes('projeto') || text.includes('plano') || text.includes('estrat├⌐gia')) {
      return 'Projetos';
    } else if (text.includes('reuni├úo') || text.includes('evento') || text.includes('agenda')) {
      return 'Eventos';
    } else if (text.includes('legal') || text.includes('lei') || text.includes('regulamento')) {
      return 'Jur├¡dico';
    } else {
      return 'Geral';
    }
  }

  private extractTags(question: string, response: string): string[] {
    const text = (question + ' ' + response).toLowerCase();
    const tags: string[] = [];
    
    const tagKeywords = {
      'urgente': ['urgente', 'emerg├¬ncia', 'prioridade'],
      'importante': ['importante', 'cr├¡tico', 'essencial'],
      'an├ílise': ['an├ílise', 'analisar', 'avalia├º├úo'],
      'relat├│rio': ['relat├│rio', 'dados', 'estat├¡stica'],
      'or├ºamento': ['or├ºamento', 'financeiro', 'custo'],
      'projeto': ['projeto', 'plano', 'estrat├⌐gia'],
      'reuni├úo': ['reuni├úo', 'evento', 'agenda'],
      'legal': ['legal', 'lei', 'regulamento']
    };

    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag);
      }
    });

    return tags;
  }
}
