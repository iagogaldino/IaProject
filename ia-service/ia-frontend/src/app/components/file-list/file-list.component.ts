import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { FileService, FileUpload, FileProcessRequest } from '../../services/file.service';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss'
})
export class FileListComponent implements OnInit {
  @Input() files: FileUpload[] = [];
  @Input() agentId: string = '';
  @Input() loading: boolean = false;
  @Output() fileDeleted = new EventEmitter<string>();
  @Output() fileProcessed = new EventEmitter<{ fileId: string; result: any }>();

  processingFiles: Set<string> = new Set();

  constructor(
    public fileService: FileService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  /**
   * Processar arquivo com IA
   */
  processFile(file: FileUpload, operation: 'read' | 'analyze' | 'summarize' | 'extract') {
    if (this.processingFiles.has(file.id)) return;

    this.processingFiles.add(file.id);

    const request: FileProcessRequest = {
      operation,
      options: {
        language: 'pt',
        maxLength: 200
      }
    };

    this.fileService.processFile(this.agentId, file.id, request).subscribe({
      next: (response) => {
        this.processingFiles.delete(file.id);
        if (response.success) {
          this.fileProcessed.emit({
            fileId: file.id,
            result: response.data
          });
          this.showSuccess(`Arquivo processado com sucesso!`);
        } else {
          this.showError('Erro ao processar arquivo');
        }
      },
      error: (error) => {
        this.processingFiles.delete(file.id);
        console.error('Erro ao processar arquivo:', error);
        this.showError('Erro ao processar arquivo');
      }
    });
  }

  /**
   * Deletar arquivo
   */
  deleteFile(file: FileUpload) {
    if (confirm(`Tem certeza que deseja excluir o arquivo "${file.originalName}"?`)) {
      this.fileService.deleteFile(this.agentId, file.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.fileDeleted.emit(file.id);
            this.showSuccess('Arquivo excluído com sucesso!');
          } else {
            this.showError('Erro ao excluir arquivo');
          }
        },
        error: (error) => {
          console.error('Erro ao excluir arquivo:', error);
          this.showError('Erro ao excluir arquivo');
        }
      });
    }
  }

  /**
   * Obter informações detalhadas do arquivo
   */
  getFileDetails(file: FileUpload) {
    this.fileService.getFileInfo(file.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Aqui você pode abrir um dialog com os detalhes
          console.log('Detalhes do arquivo:', response.data);
        }
      },
      error: (error) => {
        console.error('Erro ao obter detalhes do arquivo:', error);
        this.showError('Erro ao obter detalhes do arquivo');
      }
    });
  }

  /**
   * Formatar data para exibição
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Verificar se arquivo está sendo processado
   */
  isProcessing(fileId: string): boolean {
    return this.processingFiles.has(fileId);
  }

  /**
   * Verificar se arquivo foi processado
   */
  isProcessed(file: FileUpload): boolean {
    return !!file.processedAt;
  }

  /**
   * Obter status do arquivo
   */
  getFileStatus(file: FileUpload): string {
    if (this.isProcessing(file.id)) return 'Processando...';
    if (this.isProcessed(file)) return 'Processado';
    return 'Não processado';
  }

  /**
   * Obter cor do status
   */
  getStatusColor(file: FileUpload): string {
    if (this.isProcessing(file.id)) return '#ff9800';
    if (this.isProcessed(file)) return '#4caf50';
    return '#757575';
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'success-snackbar'
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'error-snackbar'
    });
  }
}
