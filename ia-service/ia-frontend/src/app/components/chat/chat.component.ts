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

import { AgentService, Agent, ChatMessage, ChatResponse } from '../../services/agent.service';
import { AiService, ProcessRequest } from '../../services/ai.service';

@Component({
  selector: 'app-chat',
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
    MatTooltipModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
  @Input() agents: Agent[] = [];
  @Input() currentAgent: Agent | null = null;
  
  chatForm: FormGroup;
  messages: ChatMessage[] = [];
  loading = false;
  selectedAgent: Agent | null = null;
  
  // Opções de chat
  chatMode: 'agent' | 'ai' = 'agent';
  
  constructor(
    private agentService: AgentService,
    private aiService: AiService,
    private fb: FormBuilder
  ) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]],
      agentId: ['']
    });
  }
  
  ngOnInit() {
    if (this.currentAgent) {
      this.selectedAgent = this.currentAgent;
      this.chatForm.patchValue({ agentId: this.currentAgent.id });
    } else if (this.agents.length > 0) {
      this.selectedAgent = this.agents[0];
      this.chatForm.patchValue({ agentId: this.agents[0].id });
    }
  }
  
  onSendMessage() {
    if (this.chatForm.valid && !this.loading) {
      const message = this.chatForm.get('message')?.value.trim();
      if (!message) return;
      
      // Adicionar mensagem do usuário
      const userMessage: ChatMessage = {
        role: 'user',
        content: message
      };
      this.messages.push(userMessage);
      
      // Limpar formulário
      this.chatForm.patchValue({ message: '' });
      
      // Enviar mensagem
      this.loading = true;
      
      if (this.chatMode === 'agent' && this.selectedAgent) {
        this.chatWithAgent();
      } else {
        this.chatWithAI();
      }
    }
  }
  
  chatWithAgent() {
    if (!this.selectedAgent) return;
    
    const messages = [...this.messages];
    
    this.agentService.chatWithAgent(this.selectedAgent.id, messages).subscribe({
      next: (response: ChatResponse) => {
        if (response.success) {
          this.messages.push(response.data.response);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro no chat com agente:', error);
        this.messages.push({
          role: 'agent',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem.'
        });
        this.loading = false;
      }
    });
  }
  
  chatWithAI() {
    const request: ProcessRequest = {
      prompt: this.messages[this.messages.length - 1].content,
      conversationHistory: this.messages.map(msg => ({
        sender: msg.role === 'user' ? 'user' : 'agent',
        text: msg.content,
        timestamp: new Date().toISOString()
      })),
      userId: 'user123',
      sessionId: 'session456'
    };
    
    this.aiService.processAI(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages.push({
            role: 'agent',
            content: response.data
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro no chat com IA:', error);
        this.messages.push({
          role: 'agent',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem.'
        });
        this.loading = false;
      }
    });
  }
  
  onAgentChange(agentId: string) {
    this.selectedAgent = this.agents.find(a => a.id === agentId) || null;
    this.messages = []; // Limpar histórico ao trocar agente
  }
  
  onChatModeChange(mode: 'agent' | 'ai') {
    this.chatMode = mode;
    this.messages = []; // Limpar histórico ao trocar modo
  }
  
  onClearChat() {
    this.messages = [];
  }
  
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }
  
  getActiveAgents(): Agent[] {
    return this.agents.filter(agent => agent.status === 'active');
  }
  
  canSendMessage(): boolean {
    return this.chatForm.valid && !this.loading && 
           (this.chatMode === 'ai' || (this.chatMode === 'agent' && !!this.selectedAgent));
  }
}
