import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonSearchbar, IonChip, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent, IonFab, IonFabButton, IonFabList, IonSelect, IonSelectOption, IonBackButton, IonCard, IonCardHeader, IonCardContent, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, filter, download, star, starOutline, time, folder, bookmark, ellipsisHorizontal, add, chevronDown, chevronUp, closeCircle } from 'ionicons/icons';
import { SavedMessagesService, SavedMessage } from '../services/saved-messages.service';
import { Router } from '@angular/router';
import { MarkdownPipe } from '../pipes/markdown.pipe';

@Component({
  selector: 'app-saved-messages',
  templateUrl: './saved-messages.page.html',
  styleUrls: ['./saved-messages.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, 
    IonSearchbar, IonChip, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent,
    IonFab, IonFabButton, IonFabList, IonSelect, IonSelectOption, IonBackButton, 
    IonCard, IonCardHeader, IonCardContent, IonLabel,
    CommonModule, FormsModule, MarkdownPipe
  ]
})
export class SavedMessagesPage implements OnInit {
  messages: SavedMessage[] = [];
  filteredMessages: SavedMessage[] = [];
  searchQuery: string = '';
  selectedCategory: string = 'all';
  sortBy: string = 'date';
  showFavoritesOnly: boolean = false;
  isLoading: boolean = false;
  showFilters: boolean = false;

  categories: string[] = [];
  tags: string[] = [];

  constructor(
    private savedMessagesService: SavedMessagesService,
    private router: Router
  ) {
    addIcons({
      search, filter, download, star, starOutline, time, folder, bookmark, ellipsisHorizontal, add, chevronDown, chevronUp, closeCircle
    });
  }

  ngOnInit() {
    this.loadMessages();
    this.loadFilters();
  }

  loadMessages() {
    this.savedMessagesService.savedMessages$.subscribe(messages => {
      this.messages = messages;
      this.applyFilters();
    });
  }

  loadFilters() {
    this.categories = this.savedMessagesService.getCategories();
    this.tags = this.savedMessagesService.getTags();
  }

  applyFilters() {
    let filtered = [...this.messages];

    // Search filter
    if (this.searchQuery.trim()) {
      filtered = this.savedMessagesService.searchMessages(this.searchQuery);
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(msg => msg.category === this.selectedCategory);
    }

    // Favorites filter
    if (this.showFavoritesOnly) {
      filtered = filtered.filter(msg => msg.isFavorite);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });

    this.filteredMessages = filtered;
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value;
    this.applyFilters();
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.applyFilters();
  }

  onSortChange(event: any) {
    this.sortBy = event.detail.value;
    this.applyFilters();
  }

  toggleFavorites() {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.applyFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.showFavoritesOnly = false;
    this.sortBy = 'date';
    this.showFilters = false;
    this.applyFilters();
  }

  toggleFavorite(message: SavedMessage) {
    this.savedMessagesService.toggleFavorite(message.id);
  }

  openMessage(message: SavedMessage) {
    this.router.navigate(['/message-detail', message.id]);
  }

  deleteMessage(message: SavedMessage) {
    if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
      this.savedMessagesService.deleteMessage(message.id);
    }
  }

  exportMessages(format: 'json' | 'txt' | 'csv') {
    const data = this.savedMessagesService.exportMessages(format);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mensagens_salvas.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  refresh(event: any) {
    setTimeout(() => {
      this.loadMessages();
      event.target.complete();
    }, 1000);
  }

  loadMore(event: any) {
    setTimeout(() => {
      // Implementar pagina├º├úo se necess├írio
      event.target.complete();
    }, 500);
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Financeiro': 'success',
      'Projetos': 'warning',
      'Eventos': 'secondary',
      'Jur├¡dico': 'danger',
      'Geral': 'medium'
    };
    return colors[category] || 'medium';
  }

  trackByMessageId(index: number, message: SavedMessage): string {
    return message.id;
  }

}
