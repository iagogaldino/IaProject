import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { MetadataService } from '../../services/metadata.service';

@Component({
  selector: 'app-metadata-attach-button',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './metadata-attach-button.component.html',
  styleUrl: './metadata-attach-button.component.scss'
})
export class MetadataAttachButtonComponent implements OnInit, OnDestroy {
  @Input() fileId!: string;
  @Input() agentId!: string;
  @Input() fileContent?: string;
  @Input() disabled = false;
  
  @Output() metadataAttached = new EventEmitter<void>();
  @Output() metadataDetached = new EventEmitter<void>();
  @Output() statusChanged = new EventEmitter<boolean>();

  // Estado do componente
  isAttached = false;
  isLoading = false;
  isChecking = false;
  
  private statusSubscription?: Subscription;

  constructor(
    private metadataService: MetadataService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.checkMetadataStatus();
    this.subscribeToStatusChanges();
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  /**
   * Verificar status atual dos metadados
   */
  private async checkMetadataStatus() {
    this.isChecking = true;
    try {
      this.isAttached = await this.metadataService.hasMetadata(this.fileId);
      this.statusChanged.emit(this.isAttached);
    } catch (error) {
      console.error('Erro ao verificar status dos metadados:', error);
      this.showError('Erro ao verificar status dos metadados');
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Inscrever-se nas mudanças de status dos metadados
   */
  private subscribeToStatusChanges() {
    this.statusSubscription = this.metadataService.metadataStatus$.subscribe(statusMap => {
      const newStatus = statusMap.get(this.fileId) || false;
      if (newStatus !== this.isAttached) {
        this.isAttached = newStatus;
        this.statusChanged.emit(this.isAttached);
      }
    });
  }

  /**
   * Alternar status de anexação dos metadados
   */
  async toggleMetadataAttachment() {
    if (this.isLoading) return;

    if (this.isAttached) {
      await this.detachMetadata();
    } else {
      await this.attachMetadata();
    }
  }

  /**
   * Anexar metadados ao arquivo
   */
  private async attachMetadata() {
    if (!this.fileContent) {
      this.showError('Conteúdo do arquivo não disponível para análise');
      return;
    }

    this.isLoading = true;
    
    try {
      const response = await this.metadataService.attachMetadata(
        this.fileId, 
        this.agentId, 
        this.fileContent,
        {
          language: 'pt',
          includeSentiment: true,
          includeTopics: true,
          includeSummary: true
        }
      ).toPromise();

      if (response?.success) {
        this.isAttached = true;
        this.metadataAttached.emit();
        this.statusChanged.emit(true);
        this.showSuccess('Metadados anexados com sucesso!');
      } else {
        this.showError(response?.error?.message || 'Erro ao anexar metadados');
      }
    } catch (error) {
      console.error('Erro ao anexar metadados:', error);
      this.showError('Erro ao anexar metadados');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Desanexar metadados do arquivo
   */
  private async detachMetadata() {
    this.isLoading = true;
    
    try {
      const response = await this.metadataService.detachMetadata(this.fileId).toPromise();

      if (response?.success) {
        this.isAttached = false;
        this.metadataDetached.emit();
        this.statusChanged.emit(false);
        this.showSuccess('Metadados desanexados com sucesso!');
      } else {
        this.showError(response?.error?.message || 'Erro ao desanexar metadados');
      }
    } catch (error) {
      console.error('Erro ao desanexar metadados:', error);
      this.showError('Erro ao desanexar metadados');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Obter ícone do botão baseado no estado
   */
  getButtonIcon(): string {
    if (this.isLoading) return 'hourglass_empty';
    if (this.isAttached) return 'link_off';
    return 'link';
  }

  /**
   * Obter texto do botão baseado no estado
   */
  getButtonText(): string {
    if (this.isLoading) return 'Processando...';
    if (this.isAttached) return 'Desanexar';
    return 'Anexar';
  }

  /**
   * Obter tooltip do botão
   */
  getButtonTooltip(): string {
    if (this.isLoading) return 'Processando metadados...';
    if (this.isAttached) return 'Clique para desanexar metadados do arquivo';
    return 'Clique para anexar metadados ao arquivo';
  }

  /**
   * Obter cor do botão baseado no estado
   */
  getButtonColor(): string {
    if (this.isLoading) return 'accent';
    if (this.isAttached) return 'warn';
    return 'primary';
  }

  /**
   * Verificar se o botão deve estar desabilitado
   */
  isButtonDisabled(): boolean {
    return this.disabled || this.isLoading || this.isChecking;
  }

  /**
   * Mostrar mensagem de sucesso
   */
  private showSuccess(message: string) {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'success-snackbar'
    });
  }

  /**
   * Mostrar mensagem de erro
   */
  private showError(message: string) {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'error-snackbar'
    });
  }
}
