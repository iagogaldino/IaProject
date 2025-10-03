import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { AgentGraphFixedComponent } from '../../components/agent-graph/agent-graph-fixed.component';
import { AgentService } from '../../services/agent.service';
import { Agent } from '../../services/agent.service';

@Component({
  selector: 'app-agent-graph-page',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    AgentGraphFixedComponent
  ],
  templateUrl: './agent-graph-page.component.html',
  styleUrl: './agent-graph-page.component.scss'
})
export class AgentGraphPageComponent implements OnInit, OnDestroy {
  agents: Agent[] = [];
  loading = false;
  error: string | null = null;

  constructor(private agentService: AgentService) {}

  ngOnInit() {
    this.loadAgents();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private loadAgents() {
    this.loading = true;
    this.error = null;
    
    this.agentService.getAgents().subscribe({
      next: (response) => {
        this.agents = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading agents:', error);
        this.error = 'Erro ao carregar agentes. Tente novamente.';
        this.loading = false;
      }
    });
  }

  onRefresh() {
    this.loadAgents();
  }

  onBackToDashboard() {
    // Navigation will be handled by routerLink in template
  }
}
