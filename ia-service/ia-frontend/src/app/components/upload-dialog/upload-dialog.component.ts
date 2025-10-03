import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { Agent } from '../../services/agent.service';
import { FileService, FileUpload } from '../../services/file.service';

export interface UploadDialogData {
  agents: Agent[];
}

@Component({
  selector: 'app-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './upload-dialog.component.html',
  styleUrl: './upload-dialog.component.scss'
})
export class UploadDialogComponent implements OnInit {
  selectedAgent = new FormControl('');
  selectedFiles: File[] = [];
  isUploading: boolean = false;
  uploadProgress: number = 0;
  dragOver: boolean = false;

  // Tipos de arquivo permitidos
  allowedFileTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  // Extensões permitidas para exibição
  allowedExtensions = ['.txt', '.pdf', '.doc', '.docx', '.csv', '.json', '.xls', '.xlsx'];

  constructor(
    public dialogRef: MatDialogRef<UploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UploadDialogData,
    public fileService: FileService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  /**
   * Manipular seleção de arquivos
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  /**
   * Manipular drag and drop
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  /**
   * Processar arquivos selecionados
   */
  private handleFiles(files: File[]) {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      if (this.fileService.isValidFileType(file) && this.fileService.isValidFileSize(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      this.showError(`Arquivos inválidos: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
    }
  }

  /**
   * Remover arquivo da lista
   */
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  /**
   * Limpar lista de arquivos
   */
  clearFiles() {
    this.selectedFiles = [];
    this.uploadProgress = 0;
  }

  /**
   * Fazer upload dos arquivos
   */
  uploadFiles() {
    if (this.selectedFiles.length === 0 || this.isUploading || !this.selectedAgent.value) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    const totalFiles = this.selectedFiles.length;
    let uploadedCount = 0;

    // Upload arquivos sequencialmente
    this.uploadNextFile(0, totalFiles, uploadedCount);
  }

  private uploadNextFile(index: number, totalFiles: number, uploadedCount: number) {
    if (index >= totalFiles) {
      this.isUploading = false;
      this.uploadProgress = 100;
      this.showSuccess(`${uploadedCount} arquivo(s) enviado(s) com sucesso!`);
      this.dialogRef.close({ success: true, uploadedCount });
      return;
    }

    const file = this.selectedFiles[index];
    
    this.fileService.uploadFile(this.selectedAgent.value!, file).subscribe({
      next: (response) => {
        if (response.success) {
          uploadedCount++;
        }
        
        this.uploadProgress = ((index + 1) / totalFiles) * 100;
        this.uploadNextFile(index + 1, totalFiles, uploadedCount);
      },
      error: (error) => {
        console.error('Erro ao fazer upload do arquivo:', error);
        this.showError(`Erro ao enviar ${file.name}`);
        
        this.uploadProgress = ((index + 1) / totalFiles) * 100;
        this.uploadNextFile(index + 1, totalFiles, uploadedCount);
      }
    });
  }

  /**
   * Obter ícone do tipo de arquivo
   */
  getFileIcon(file: File): string {
    return this.fileService.getFileIcon(file.type);
  }

  /**
   * Obter cor do tipo de arquivo
   */
  getFileColor(file: File): string {
    return this.fileService.getFileColor(file.type);
  }

  /**
   * Formatar tamanho do arquivo
   */
  formatFileSize(size: number): string {
    return this.fileService.formatFileSize(size);
  }

  /**
   * Verificar se há arquivos selecionados
   */
  hasSelectedFiles(): boolean {
    return this.selectedFiles.length > 0;
  }

  /**
   * Verificar se pode fazer upload
   */
  canUpload(): boolean {
    return this.hasSelectedFiles() && !this.isUploading && !!this.selectedAgent.value;
  }

  /**
   * Fechar dialog
   */
  onCancel() {
    this.dialogRef.close({ success: false });
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
