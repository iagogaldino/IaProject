import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { Agent } from '../../services/agent.service';

@Component({
  selector: 'app-agent-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './agent-list.component.html',
  styleUrl: './agent-list.component.scss'
})
export class AgentListComponent {
  @Input() agents: Agent[] = [];
  @Input() loading = false;
  @Input() editingAgentId: string | null = null;
  
  @Output() editAgent = new EventEmitter<Agent>();
  
  // Controla quais descrições estão expandidas
  expandedDescriptions: { [key: string]: boolean } = {};
  @Output() deleteAgent = new EventEmitter<Agent>();
  @Output() toggleStatus = new EventEmitter<Agent>();
  @Output() chatWithAgent = new EventEmitter<Agent>();
  
  onEditAgent(agent: Agent) {
    this.editAgent.emit(agent);
  }
  
  onDeleteAgent(agent: Agent) {
    this.deleteAgent.emit(agent);
  }
  
  onToggleStatus(agent: Agent) {
    this.toggleStatus.emit(agent);
  }
  
  onChatWithAgent(agent: Agent) {
    this.chatWithAgent.emit(agent);
  }
  
  getStatusColor(status: string): string {
    return status === 'active' ? 'var(--success-color)' : 'var(--text-secondary)';
  }
  
  getStatusIcon(status: string): string {
    return status === 'active' ? 'check_circle' : 'pause_circle';
  }
  
  getDatabaseAccessText(agent: Agent): string {
    if (agent.databaseAccess?.enabled) {
      return `${agent.databaseAccess.allowedCollections.length} coleções`;
    }
    return 'Sem acesso';
  }
  
  getCommunicationText(agent: Agent): string {
    return agent.canCommunicateWith.length > 0 
      ? `${agent.canCommunicateWith.length} agente(s)` 
      : 'Isolado';
  }
  
  isAgentBeingEdited(agent: Agent): boolean {
    return this.editingAgentId === agent.id;
  }
  
  toggleDescription(agent: Agent) {
    this.expandedDescriptions[agent.id] = !this.expandedDescriptions[agent.id];
  }
}