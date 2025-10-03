import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';

import { AgentService, Agent } from '../../services/agent.service';
import { FileService, FileUpload } from '../../services/file.service';
import { UploadDialogComponent } from '../../components/upload-dialog/upload-dialog.component';
import { MetadataService } from '../../services/metadata.service';
import { MetadataAttachButtonComponent } from '../../components/metadata-attach-button/metadata-attach-button.component';

@Component({
  selector: 'app-file-management',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MetadataAttachButtonComponent,
  ],
  templateUrl: './file-management.component.html',
  styleUrl: './file-management.component.scss'
})
export class FileManagementComponent implements OnInit {
  protected readonly title = signal('Gerenciamento de Arquivos');
  
  // Data
  agents: Agent[] = [];
  files: FileUpload[] = [];
  selectedFile: FileUpload | null = null;
  
  // UI State
  loading = false;
  selectedTab = 0;
  
  // Stats
  totalFiles = 0;
  totalSize = 0;
  processedFiles = 0;
  
  constructor(
    private agentService: AgentService,
    public fileService: FileService,
    private metadataService: MetadataService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}
  
  ngOnInit() {
    this.loadAgents();
    this.loadAllFiles(); // Carregar todos os arquivos por padrão
  }
  
  /**
   * Carregar agentes disponíveis
   */
  loadAgents() {
    this.agentService.getAgents().subscribe({
      next: (response) => {
        if (response.success) {
          this.agents = response.data.filter(agent => 
            agent.fileAccess?.enabled === true
          );
        }
      },
      error: (error) => {
        console.error('Erro ao carregar agentes:', error);
        this.showError('Erro ao carregar agentes');
      }
    });
  }
  
  /**
   * Carregar todos os arquivos do sistema
   */
  loadAllFiles() {
    this.loading = true;
    this.fileService.getAllFiles().subscribe({
      next: (response) => {
        if (response.success) {
          this.files = response.data;
          this.calculateStats();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar todos os arquivos:', error);
        this.showError('Erro ao carregar arquivos');
        this.loading = false;
      }
    });
  }

  
  /**
   * Calcular estatísticas dos arquivos
   */
  private calculateStats() {
    this.totalFiles = this.files.length;
    this.totalSize = this.files.reduce((sum, file) => sum + file.fileSize, 0);
    this.processedFiles = this.files.filter(file => file.processedAt).length;
  }
  
  /**
   * Mostrar todos os arquivos
   */
  showAllFilesView() {
    this.selectedFile = null;
    this.loadAllFiles();
  }

  /**
   * Selecionar arquivo
   */
  selectFile(file: FileUpload) {
    this.selectedFile = file;
  }
  
  /**
   * Alternar aba ou abrir upload dialog
   */
  onTabChange(index: number) {
    if (index === 1) {
      // Abrir dialog de upload quando clicar no botão +
      this.openUploadDialog();
    } else {
      this.selectedTab = index;
      this.cdr.detectChanges();
    }
  }

  /**
   * Abrir dialog de upload
   */
  openUploadDialog() {
    if (this.agents.length === 0) {
      this.showError('Nenhum agente com acesso a arquivos encontrado. Crie um agente com permissão de arquivos primeiro.');
      return;
    }

    const dialogRef = this.dialog.open(UploadDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        agents: this.agents
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Recarregar lista de arquivos após upload bem-sucedido
        this.loadAllFiles();
        this.showSuccess(`Upload concluído! ${result.uploadedCount} arquivo(s) enviado(s).`);
      }
    });
  }

  
  

  /**
   * Arquivo deletado
   */
  onFileDeleted(fileId: string) {
    this.files = this.files.filter(file => file.id !== fileId);
    this.calculateStats();
  }
  
  /**
   * Arquivo processado
   */
  onFileProcessed(event: { fileId: string; result: any }) {
    const file = this.files.find(f => f.id === event.fileId);
    if (file) {
      file.processedAt = new Date().toISOString();
      file.content = event.result.content;
      this.calculateStats();
    }
  }

  /**
   * Processar arquivo com IA
   */
  processFile(operation: 'read' | 'analyze' | 'summarize' | 'extract') {
    if (!this.selectedFile) return;

    this.fileService.processFile(this.selectedFile.agentId, this.selectedFile.id, {
      operation,
      options: {
        language: 'pt',
        maxLength: 200
      }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedFile!.processedAt = new Date().toISOString();
          this.selectedFile!.content = response.data.content;
          this.calculateStats();
          this.showSuccess(`Arquivo ${operation === 'read' ? 'lido' : operation === 'analyze' ? 'analisado' : operation === 'summarize' ? 'resumido' : 'processado'} com sucesso!`);
        } else {
          this.showError('Erro ao processar arquivo');
        }
      },
      error: (error) => {
        console.error('Erro ao processar arquivo:', error);
        this.showError('Erro ao processar arquivo');
      }
    });
  }

  /**
   * Deletar arquivo
   */
  deleteFile() {
    if (!this.selectedFile) return;

    if (confirm(`Tem certeza que deseja excluir o arquivo "${this.selectedFile.originalName}"?`)) {
      this.fileService.deleteFile(this.selectedFile.agentId, this.selectedFile.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.files = this.files.filter(f => f.id !== this.selectedFile!.id);
            this.selectedFile = null;
            this.calculateStats();
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
   * Atualizar dados
   */
  onRefresh() {
    this.loadAllFiles();
    this.loadAgents();
  }
  
  /**
   * Formatar tamanho total
   */
  formatTotalSize(): string {
    return this.fileService.formatFileSize(this.totalSize);
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
   * Obter percentual de arquivos processados
   */
  getProcessedPercentage(): number {
    if (this.totalFiles === 0) return 0;
    return Math.round((this.processedFiles / this.totalFiles) * 100);
  }
  
  /**
   * Verificar se há agentes disponíveis
   */
  hasAgents(): boolean {
    return this.agents.length > 0;
  }
  
  /**
   * Verificar se há arquivos
   */
  hasFiles(): boolean {
    return this.files.length > 0;
  }

  /**
   * Obter nome do agente de um arquivo
   */
  getAgentName(file: FileUpload): string {
    const agent = this.agents.find(a => a.id === file.agentId);
    return agent ? agent.name : 'Agente não encontrado';
  }

  /**
   * Callback quando metadados são anexados
   */
  onMetadataAttached() {
    console.log('Metadados anexados com sucesso!');
    // Atualizar estatísticas se necessário
    this.calculateStats();
  }

  /**
   * Callback quando metadados são desanexados
   */
  onMetadataDetached() {
    console.log('Metadados desanexados com sucesso!');
    // Atualizar estatísticas se necessário
    this.calculateStats();
  }

  /**
   * Callback quando status dos metadados muda
   */
  onMetadataStatusChanged(isAttached: boolean) {
    console.log(`Status dos metadados alterado: ${isAttached ? 'anexado' : 'desanexado'}`);
    // Aqui você pode adicionar lógica adicional se necessário
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
