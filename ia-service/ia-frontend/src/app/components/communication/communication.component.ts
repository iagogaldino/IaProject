import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

import { AgentService, Agent, Message, CommunicationStats } from '../../services/agent.service';

@Component({
  selector: 'app-communication',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatTabsModule,
    MatBadgeModule
  ],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.scss'
})
export class CommunicationComponent implements OnInit {
  @Input() agents: Agent[] = [];
  @Input() stats: CommunicationStats | null = null;
  
  // Forms
  messageForm: FormGroup;
  
  // Data
  messages: Message[] = [];
  selectedAgent: Agent | null = null;
  loading = false;
  
  // UI State
  selectedTab = 0;
  
  constructor(
    private agentService: AgentService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      toAgentId: ['', Validators.required],
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }
  
  ngOnInit() {
    if (this.agents.length > 0) {
      this.selectedAgent = this.agents[0];
      this.loadMessages(this.agents[0].id);
    }
  }
  
  onAgentSelect(agent: Agent) {
    this.selectedAgent = agent;
    this.loadMessages(agent.id);
  }
  
  loadMessages(agentId: string) {
    this.loading = true;
    this.agentService.getMessages(agentId, 50, 0).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar mensagens:', error);
        this.loading = false;
      }
    });
  }
  
  onSendMessage() {
    if (this.messageForm.valid && this.selectedAgent) {
      const formValue = this.messageForm.value;
      
      this.agentService.sendMessage(this.selectedAgent.id, {
        toAgentId: formValue.toAgentId,
        content: formValue.content
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageForm.patchValue({ content: '' });
            this.loadMessages(this.selectedAgent!.id);
          }
        },
        error: (error) => {
          console.error('Erro ao enviar mensagem:', error);
        }
      });
    }
  }
  
  onTabChange(index: number) {
    this.selectedTab = index;
  }
  
  getActiveAgents(): Agent[] {
    return this.agents.filter(agent => agent.status === 'active');
  }
  
  getMessageCount(agent: Agent): number {
    // Implementar contagem de mensagens por agente
    return 0;
  }
  
  getUnreadCount(agent: Agent): number {
    // Implementar contagem de mensagens não lidas
    return 0;
  }
  
  formatMessageTime(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }
  
  getMessageDirection(message: Message): 'sent' | 'received' {
    // Assumindo que mensagens enviadas têm fromAgentId igual ao agente selecionado
    return message.fromAgentId === this.selectedAgent?.id ? 'sent' : 'received';
  }
}
