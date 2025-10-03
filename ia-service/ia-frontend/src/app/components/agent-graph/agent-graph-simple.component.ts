import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Agent } from '../../services/agent.service';

@Component({
  selector: 'app-agent-graph-simple',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="simple-graph-container">
      <div class="graph-header">
        <h2>
          <mat-icon>account_tree</mat-icon>
          Rede de Agentes (Versão Simples)
        </h2>
        <p>Visualização das conexões entre agentes</p>
      </div>
      
      <div class="graph-content">
        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Carregando rede de agentes...</p>
        </div>
        
        <div *ngIf="!loading && agents.length === 0" class="empty-state">
          <mat-icon>account_tree</mat-icon>
          <h3>Nenhum agente encontrado</h3>
          <p>Adicione agentes para visualizar a rede de conexões</p>
        </div>
        
        <div *ngIf="!loading && agents.length > 0" class="agents-network">
          <div class="network-stats">
            <div class="stat-item">
              <mat-icon>account_circle</mat-icon>
              <span>{{ agents.length }} agente(s)</span>
            </div>
            <div class="stat-item">
              <mat-icon>link</mat-icon>
              <span>{{ getTotalConnections() }} conexão(ões)</span>
            </div>
            <div class="stat-item">
              <mat-icon>storage</mat-icon>
              <span>{{ getDatabaseAgentsCount() }} com acesso ao DB</span>
            </div>
          </div>
          
          <div class="agents-grid">
            <div *ngFor="let agent of agents" class="agent-node" 
                 [class.active]="agent.status === 'active'"
                 [class.inactive]="agent.status === 'inactive'">
              <div class="agent-icon">
                <mat-icon>smart_toy</mat-icon>
              </div>
              <div class="agent-info">
                <h4>{{ agent.name }}</h4>
                <p>{{ agent.description | slice:0:100 }}{{ agent.description.length > 100 ? '...' : '' }}</p>
                <div class="agent-status">
                  <mat-icon [class.status-active]="agent.status === 'active'" 
                           [class.status-inactive]="agent.status === 'inactive'">
                    {{ agent.status === 'active' ? 'check_circle' : 'pause_circle' }}
                  </mat-icon>
                  <span>{{ agent.status | titlecase }}</span>
                </div>
              </div>
              
              <div class="agent-connections" *ngIf="agent.canCommunicateWith.length > 0">
                <div class="connection-label">
                  <mat-icon>chat</mat-icon>
                  <span>Comunica com:</span>
                </div>
                <div class="connection-list">
                  <span *ngFor="let connectionId of agent.canCommunicateWith" 
                        class="connection-item">
                    {{ getAgentName(connectionId) }}
                  </span>
                </div>
              </div>
              
              <div class="agent-database" *ngIf="agent.databaseAccess?.enabled">
                <div class="database-label">
                  <mat-icon>storage</mat-icon>
                  <span>Acesso ao Banco de Dados</span>
                </div>
                <div class="database-info">
                  <span>{{ agent.databaseAccess?.allowedCollections?.length || 0 }} coleções</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simple-graph-container {
      padding: 1rem;
      background: #f5f5f5;
      min-height: 100vh;
    }
    
    .graph-header {
      text-align: center;
      margin-bottom: 2rem;
      
      h2 {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin: 0 0 0.5rem 0;
        color: #333;
        
        mat-icon {
          color: #2196F3;
        }
      }
      
      p {
        color: #666;
        margin: 0;
      }
    }
    
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
      color: #666;
      
      mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
        color: #666;
      }
      
      h3 {
        margin: 0.5rem 0;
        color: #333;
      }
    }
    
    .network-stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #666;
        
        mat-icon {
          color: #2196F3;
        }
      }
    }
    
    .agents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .agent-node {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.15);
      }
      
      &.active {
        border-left: 4px solid #4CAF50;
      }
      
      &.inactive {
        border-left: 4px solid #757575;
        opacity: 0.7;
      }
    }
    
    .agent-icon {
      text-align: center;
      margin-bottom: 1rem;
      
      mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
        color: #2196F3;
      }
    }
    
    .agent-info {
      text-align: center;
      margin-bottom: 1rem;
      
      h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1.1rem;
      }
      
      p {
        margin: 0 0 1rem 0;
        color: #666;
        font-size: 0.875rem;
        line-height: 1.4;
      }
    }
    
    .agent-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      
      .status-active {
        color: #4CAF50;
      }
      
      .status-inactive {
        color: #757575;
      }
    }
    
    .agent-connections, .agent-database {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      
      .connection-label, .database-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #333;
        margin-bottom: 0.5rem;
        
        mat-icon {
          font-size: 1rem;
          width: 1rem;
          height: 1rem;
        }
      }
      
      .connection-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        
        .connection-item {
          background: #e3f2fd;
          color: #1976d2;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
        }
      }
      
      .database-info {
        color: #666;
        font-size: 0.875rem;
      }
    }
    
    .agent-database {
      .database-label mat-icon {
        color: #FF9800;
      }
    }
    
    @media (max-width: 768px) {
      .network-stats {
        flex-direction: column;
        gap: 1rem;
      }
      
      .agents-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AgentGraphSimpleComponent implements OnInit {
  @Input() agents: Agent[] = [];
  @Input() loading = false;

  ngOnInit() {
    console.log('Simple graph component initialized with agents:', this.agents.length);
  }

  getTotalConnections(): number {
    return this.agents.reduce((total, agent) => total + (agent.canCommunicateWith?.length || 0), 0);
  }

  getDatabaseAgentsCount(): number {
    return this.agents.filter(agent => agent.databaseAccess?.enabled).length;
  }

  getAgentName(agentId: string): string {
    const agent = this.agents.find(a => a.id === agentId);
    return agent ? agent.name : `Agente ${agentId ? agentId.slice(0, 8) : 'Unknown'}...`;
  }
}
