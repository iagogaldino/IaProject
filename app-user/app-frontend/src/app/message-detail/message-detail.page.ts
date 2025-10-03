import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonChip, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonFab, IonFabButton, IonFabList, IonItem, IonLabel, IonList, IonTextarea, IonPopover } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starOutline, share, download, create, trash, arrowBack, time, folder, bookmark, copy, checkmark } from 'ionicons/icons';
import { SavedMessagesService, SavedMessage } from '../services/saved-messages.service';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.page.html',
  styleUrls: ['./message-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon,
    IonChip, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonFab, IonFabButton, IonFabList, IonItem, IonLabel, IonList, IonTextarea, IonPopover,
    CommonModule, FormsModule
  ]
})
export class MessageDetailPage implements OnInit {
  message: SavedMessage | undefined;
  isEditing: boolean = false;
  editTitle: string = '';
  editContent: string = '';
  showShareOptions: boolean = false;
  copySuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private savedMessagesService: SavedMessagesService
  ) {
    addIcons({
      star, starOutline, share, download, create, trash, arrowBack, 
      time, folder, bookmark, copy, checkmark
    });
  }

  ngOnInit() {
    const messageId = this.route.snapshot.paramMap.get('id');
    if (messageId) {
      this.message = this.savedMessagesService.getMessageById(messageId);
      if (!this.message) {
        this.router.navigate(['/saved-messages']);
      }
    }
  }

  toggleFavorite() {
    if (this.message) {
      this.savedMessagesService.toggleFavorite(this.message.id);
      this.message.isFavorite = !this.message.isFavorite;
    }
  }

  startEditing() {
    if (this.message) {
      this.isEditing = true;
      this.editTitle = this.message.title;
      this.editContent = this.message.content;
    }
  }

  saveEdit() {
    if (this.message) {
      this.savedMessagesService.updateMessage(this.message.id, {
        title: this.editTitle,
        content: this.editContent
      });
      this.message.title = this.editTitle;
      this.message.content = this.editContent;
      this.isEditing = false;
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editTitle = '';
    this.editContent = '';
  }

  deleteMessage() {
    if (this.message && confirm('Tem certeza que deseja excluir esta mensagem?')) {
      this.savedMessagesService.deleteMessage(this.message.id);
      this.router.navigate(['/saved-messages']);
    }
  }

  shareMessage() {
    if (this.message) {
      if (navigator.share) {
        navigator.share({
          title: this.message.title,
          text: this.message.content,
          url: window.location.href
        });
      } else {
        this.showShareOptions = true;
      }
    }
  }

  copyToClipboard() {
    if (this.message) {
      const text = `${this.message.title}\n\n${this.message.content}`;
      navigator.clipboard.writeText(text).then(() => {
        this.copySuccess = true;
        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      });
    }
  }

  exportMessage() {
    if (this.message) {
      const data = JSON.stringify(this.message, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.message.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  goBack() {
    this.router.navigate(['/saved-messages']);
  }
}
