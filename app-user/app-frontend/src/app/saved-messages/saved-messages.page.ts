import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonSearchbar, IonChip, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent, IonFab, IonFabButton, IonFabList, IonSelect, IonSelectOption, IonBackButton, IonCard, IonCardHeader, IonCardContent, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, filter, download, star, starOutline, time, folder, bookmark, ellipsisHorizontal, add, chevronDown, chevronUp, closeCircle, trash, documentText, refresh, grid, documentTextOutline, printOutline } from 'ionicons/icons';
import { SavedMessagesService, SavedMessage } from '../services/saved-messages.service';
import { Router } from '@angular/router';
import { MarkdownPipe } from '../pipes/markdown.pipe';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { marked } from 'marked';

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
      search, filter, download, star, starOutline, time, folder, bookmark, ellipsisHorizontal, add, chevronDown, chevronUp, closeCircle, trash, documentText, refresh, grid, documentTextOutline, printOutline
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
      // Implementar paginação se necessário
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
      'Jurídico': 'danger',
      'Geral': 'medium'
    };
    return colors[category] || 'medium';
  }

  trackByMessageId(index: number, message: SavedMessage): string {
    return message.id;
  }

  async exportToPDF(message: SavedMessage): Promise<void> {
    try {
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

      // Adiciona o título da mensagem
      const messageTitle = document.createElement('h2');
      messageTitle.textContent = message.title;
      messageTitle.style.fontSize = '20px';
      messageTitle.style.marginBottom = '15px';
      messageTitle.style.color = '#0056A6';
      pdfContainer.appendChild(messageTitle);

      // Adiciona a pergunta do usuário
      if (message.userQuestion) {
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
        questionText.textContent = message.userQuestion;
        questionDiv.appendChild(questionText);
        
        pdfContainer.appendChild(questionDiv);
      }

      // Adiciona a resposta (conteúdo markdown convertido para HTML simples)
      const responseDiv = document.createElement('div');
      responseDiv.style.marginTop = '20px';
      responseDiv.style.lineHeight = '1.6';
      
      // Converte markdown para HTML simples
      const markdownText = message.aiResponse || message.content;
      const htmlContent = this.convertMarkdownToHTML(markdownText);
      responseDiv.innerHTML = htmlContent;
      
      pdfContainer.appendChild(responseDiv);

      // Adiciona informações adicionais (categoria, tags, data)
      const infoDiv = document.createElement('div');
      infoDiv.style.marginTop = '20px';
      infoDiv.style.padding = '10px';
      infoDiv.style.backgroundColor = '#f9f9f9';
      infoDiv.style.borderRadius = '5px';
      infoDiv.style.fontSize = '12px';
      
      if (message.category) {
        const categorySpan = document.createElement('div');
        categorySpan.innerHTML = `<strong>Categoria:</strong> ${message.category}`;
        infoDiv.appendChild(categorySpan);
      }
      
      if (message.tags && message.tags.length > 0) {
        const tagsSpan = document.createElement('div');
        tagsSpan.style.marginTop = '5px';
        tagsSpan.innerHTML = `<strong>Tags:</strong> ${message.tags.join(', ')}`;
        infoDiv.appendChild(tagsSpan);
      }
      
      const dateSpan = document.createElement('div');
      dateSpan.style.marginTop = '5px';
      dateSpan.innerHTML = `<strong>Data:</strong> ${message.timestamp.toLocaleString('pt-BR')}`;
      infoDiv.appendChild(dateSpan);
      
      pdfContainer.appendChild(infoDiv);

      // Adiciona data/hora de geração
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
      const fileName = `${message.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().getTime()}.pdf`;
      
      // Salva o PDF
      pdf.save(fileName);

      console.log('PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  }

  async exportAllToPDF(): Promise<void> {
    if (this.filteredMessages.length === 0) {
      alert('Não há mensagens para exportar.');
      return;
    }

    try {
      // Cria um elemento temporário para renderizar o conteúdo do PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.width = '210mm'; // A4 width
      pdfContainer.style.padding = '20mm';
      pdfContainer.style.backgroundColor = '#ffffff';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      pdfContainer.style.color = '#000000';

      // Adiciona o título principal
      const mainTitle = document.createElement('h1');
      mainTitle.textContent = 'Conect Juju - Mensagens Salvas';
      mainTitle.style.fontSize = '24px';
      mainTitle.style.marginBottom = '10px';
      mainTitle.style.color = '#0056A6';
      pdfContainer.appendChild(mainTitle);

      // Adiciona informações sobre a exportação
      const infoDiv = document.createElement('div');
      infoDiv.style.marginBottom = '30px';
      infoDiv.style.padding = '10px';
      infoDiv.style.backgroundColor = '#f5f5f5';
      infoDiv.style.borderRadius = '5px';
      infoDiv.style.fontSize = '12px';
      infoDiv.innerHTML = `
        <strong>Total de mensagens:</strong> ${this.filteredMessages.length}<br>
        <strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}
      `;
      pdfContainer.appendChild(infoDiv);

      // Adiciona cada mensagem
      this.filteredMessages.forEach((message, index) => {
        // Adiciona separador entre mensagens (exceto na primeira)
        if (index > 0) {
          const separator = document.createElement('hr');
          separator.style.margin = '30px 0';
          separator.style.border = 'none';
          separator.style.borderTop = '2px solid #e0e0e0';
          pdfContainer.appendChild(separator);
        }

        // Título da mensagem
        const messageTitle = document.createElement('h2');
        messageTitle.textContent = `${index + 1}. ${message.title}`;
        messageTitle.style.fontSize = '18px';
        messageTitle.style.marginBottom = '15px';
        messageTitle.style.color = '#0056A6';
        pdfContainer.appendChild(messageTitle);

        // Pergunta do usuário
        if (message.userQuestion) {
          const questionDiv = document.createElement('div');
          questionDiv.style.marginBottom = '15px';
          questionDiv.style.padding = '10px';
          questionDiv.style.backgroundColor = '#f9f9f9';
          questionDiv.style.borderRadius = '5px';
          
          const questionLabel = document.createElement('strong');
          questionLabel.textContent = 'Pergunta: ';
          questionLabel.style.color = '#0056A6';
          questionDiv.appendChild(questionLabel);
          
          const questionText = document.createElement('span');
          questionText.textContent = message.userQuestion;
          questionDiv.appendChild(questionText);
          
          pdfContainer.appendChild(questionDiv);
        }

        // Resposta
        const responseDiv = document.createElement('div');
        responseDiv.style.marginTop = '10px';
        responseDiv.style.lineHeight = '1.6';
        
        const markdownText = message.aiResponse || message.content;
        const htmlContent = this.convertMarkdownToHTML(markdownText);
        responseDiv.innerHTML = htmlContent;
        
        pdfContainer.appendChild(responseDiv);

        // Metadados
        const metaDiv = document.createElement('div');
        metaDiv.style.marginTop = '15px';
        metaDiv.style.padding = '8px';
        metaDiv.style.backgroundColor = '#f9f9f9';
        metaDiv.style.borderRadius = '5px';
        metaDiv.style.fontSize = '11px';
        
        let metaContent = '';
        if (message.category) {
          metaContent += `<strong>Categoria:</strong> ${message.category}<br>`;
        }
        if (message.tags && message.tags.length > 0) {
          metaContent += `<strong>Tags:</strong> ${message.tags.join(', ')}<br>`;
        }
        metaContent += `<strong>Data:</strong> ${message.timestamp.toLocaleString('pt-BR')}`;
        
        metaDiv.innerHTML = metaContent;
        pdfContainer.appendChild(metaDiv);
      });

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
      const fileName = `mensagens-salvas-${new Date().getTime()}.pdf`;
      
      // Salva o PDF
      pdf.save(fileName);

      console.log('PDF gerado com sucesso:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
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

}
