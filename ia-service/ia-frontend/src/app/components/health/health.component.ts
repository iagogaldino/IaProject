import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HealthResponse } from '../../services/agent.service';

@Component({
  selector: 'app-health',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './health.component.html',
  styleUrl: './health.component.scss'
})
export class HealthComponent {
  @Input() health: HealthResponse | null = null;
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'healthy': return 'var(--success-color)';
      case 'error': return 'var(--error-color)';
      default: return 'var(--warning-color)';
    }
  }
  
  getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy': return 'check_circle';
      case 'error': return 'error';
      default: return 'warning';
    }
  }
  
  getServiceStatus(service: boolean): { color: string; icon: string; text: string } {
    if (service) {
      return { color: 'var(--success-color)', icon: 'check_circle', text: 'Operacional' };
    } else {
      return { color: 'var(--error-color)', icon: 'error', text: 'Indisponível' };
    }
  }
  
  formatUptime(uptime: number): string {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  getErrorRateColor(errorRate: number): string {
    if (errorRate < 0.05) return 'var(--success-color)';
    if (errorRate < 0.1) return 'var(--warning-color)';
    return 'var(--error-color)';
  }
  
  getSuccessRate(): number {
    if (!this.health?.metrics) return 0;
    const { totalRequests, successfulRequests } = this.health.metrics;
    return totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
  }
  
  getServicesList() {
    if (!this.health?.services) return [];
    
    return [
      { name: 'OpenAI', status: this.getServiceStatus(this.health.services.openai) },
      { name: 'API Key', status: this.getServiceStatus(this.health.services.apiKey) },
      { name: 'JWT Secret', status: this.getServiceStatus(this.health.services.jwtSecret) },
      { name: 'Database', status: this.getServiceStatus(this.health.services.database) }
    ];
  }
  
  getAgentUsageList() {
    if (!this.health?.metrics?.agentUsage) return [];
    
    return Object.entries(this.health.metrics.agentUsage).map(([agentId, count]) => ({
      agentId,
      count
    }));
  }
}
