import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

import { AgentService, Agent, HealthResponse, CommunicationStats } from '../../services/agent.service';
import { AiService } from '../../services/ai.service';
import { AgentListComponent } from '../../components/agent-list/agent-list.component';
import { AgentFormComponent } from '../../components/agent-form/agent-form.component';
import { ChatComponent } from '../../components/chat/chat.component';
import { CommunicationComponent } from '../../components/communication/communication.component';
import { HealthComponent } from '../../components/health/health.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatGridListModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatTabsModule,
    MatBadgeModule,
    AgentListComponent,
    AgentFormComponent,
    ChatComponent,
    CommunicationComponent,
    HealthComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  protected readonly title = signal('IA Service Platform');
  
  // Data
  agents: Agent[] = [];
  health: HealthResponse | null = null;
  communicationStats: CommunicationStats | null = null;
  
  // UI State
  loading = false;
  selectedTab = 0;
  showAgentForm = false;
  showChat = false;
  showCommunication = false;
  currentAgent: Agent | null = null;
  editingAgentId: string | null = null;
  
  // Stats
  totalAgents = 0;
  activeAgents = 0;
  totalMessages = 0;
  systemHealth = 'unknown';
  
  constructor(
    private agentService: AgentService,
    private aiService: AiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  
  ngOnInit() {
    this.loadData();
  }
  
  loadData() {
    this.loading = true;
    this.loadAgents();
    this.loadHealth();
    this.loadCommunicationStats();
  }
  
  loadAgents() {
    this.agentService.getAgents().subscribe({
      next: (response) => {
        if (response.success) {
          this.agents = response.data;
          this.totalAgents = response.meta.total;
          this.activeAgents = this.agents.filter(a => a.status === 'active').length;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar agentes:', error);
        this.showError('Erro ao carregar agentes');
        this.loading = false;
      }
    });
  }
  
  loadHealth() {
    this.agentService.getHealth().subscribe({
      next: (health) => {
        this.health = health;
        this.systemHealth = health.status;
      },
      error: (error) => {
        console.error('Erro ao carregar status do sistema:', error);
        this.systemHealth = 'error';
      }
    });
  }
  
  loadCommunicationStats() {
    this.agentService.getCommunicationStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.communicationStats = response.data;
          this.totalMessages = response.data.totalMessages;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas de comunicação:', error);
      }
    });
  }
  
  // Event Handlers
  onCreateAgent() {
    this.currentAgent = null;
    this.showAgentForm = true;
  }
  
  onEditAgent(agent: Agent) {
    this.currentAgent = agent;
    this.editingAgentId = agent.id;
    this.showAgentForm = true;
  }
  
  onDeleteAgent(agent: Agent) {
    if (confirm(`Tem certeza que deseja excluir o agente "${agent.name}"?`)) {
      this.agentService.deleteAgent(agent.id).subscribe({
        next: () => {
          this.showSuccess('Agente excluído com sucesso!');
          this.loadAgents();
        },
        error: (error) => {
          console.error('Erro ao excluir agente:', error);
          this.showError('Erro ao excluir agente');
        }
      });
    }
  }
  
  onToggleAgentStatus(agent: Agent) {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active';
    this.agentService.updateAgentStatus(agent.id, newStatus).subscribe({
      next: () => {
        this.showSuccess(`Agente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
        this.loadAgents();
      },
      error: (error) => {
        console.error('Erro ao alterar status do agente:', error);
        this.showError('Erro ao alterar status do agente');
      }
    });
  }
  
  onChatWithAgent(agent: Agent) {
    this.currentAgent = agent;
    this.showChat = true;
    this.selectedTab = 1;
  }
  
  onShowCommunication() {
    this.showCommunication = true;
    this.selectedTab = 2;
  }
  
  onCloseAgentForm() {
    this.showAgentForm = false;
    this.currentAgent = null;
    this.editingAgentId = null;
  }
  
  onCloseChat() {
    this.showChat = false;
    this.currentAgent = null;
  }
  
  onCloseCommunication() {
    this.showCommunication = false;
  }
  
  onSaveAgent(agent: Partial<Agent>) {
    const operation = agent.id 
      ? this.agentService.updateAgent(agent.id, agent)
      : this.agentService.createAgent(agent);
    
    operation.subscribe({
      next: () => {
        this.showSuccess(agent.id ? 'Agente atualizado com sucesso!' : 'Agente criado com sucesso!');
        this.onCloseAgentForm();
        this.loadAgents();
      },
      error: (error) => {
        console.error('Erro ao salvar agente:', error);
        this.showError('Erro ao salvar agente');
      }
    });
  }
  
  onRefresh() {
    this.loadData();
  }
  
  onTabChange(index: number) {
    this.selectedTab = index;
  }
  
  // Utility Methods
  showSuccess(message: string) {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'success-snackbar'
    });
  }
  
  showError(message: string) {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'error-snackbar'
    });
  }
  
  getHealthColor(): string {
    switch (this.systemHealth) {
      case 'healthy': return 'var(--success-color)';
      case 'error': return 'var(--error-color)';
      default: return 'var(--warning-color)';
    }
  }
  
  getHealthIcon(): string {
    switch (this.systemHealth) {
      case 'healthy': return 'check_circle';
      case 'error': return 'error';
      default: return 'warning';
    }
  }
}