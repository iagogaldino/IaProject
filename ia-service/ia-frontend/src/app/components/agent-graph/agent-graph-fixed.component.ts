import { Component, Input, OnInit, OnDestroy, OnChanges, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as d3 from 'd3';

import { Agent } from '../../services/agent.service';

interface GraphNode {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  canCommunicateWith: string[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: string;
  target: string;
  type: 'communication' | 'database';
}

@Component({
  selector: 'app-agent-graph-fixed',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="agent-graph-container">
      <div class="graph-header">
        <div class="header-info">
          <h2>
            <mat-icon>account_tree</mat-icon>
            Rede de Agentes
          </h2>
          <p>Visualização das conexões e comunicação entre agentes</p>
        </div>
        
        <div class="header-actions">
          <button 
            mat-icon-button 
            (click)="onRefresh()"
            matTooltip="Atualizar grafo">
            <mat-icon>refresh</mat-icon>
          </button>
          
          <button 
            mat-icon-button 
            (click)="onResetLayout()"
            matTooltip="Resetar layout">
            <mat-icon>view_module</mat-icon>
          </button>
        </div>
      </div>
      
      <div class="graph-legend">
        <div class="legend-item">
          <div class="legend-color communication"></div>
          <span>Comunicação entre agentes</span>
        </div>
        <div class="legend-item">
          <div class="legend-color database"></div>
          <span>Acesso ao banco de dados</span>
        </div>
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
        
        <div 
          *ngIf="!loading && agents.length > 0" 
          class="graph-svg-container"
          #graphContainer>
        </div>
      </div>
      
      <div class="graph-stats" *ngIf="!loading && agents.length > 0">
        <div class="stat-item">
          <mat-icon>account_circle</mat-icon>
          <span>{{ agents.length }} agente(s)</span>
        </div>
        <div class="stat-item">
          <mat-icon>link</mat-icon>
          <span>{{ links.length }} conexão(ões)</span>
        </div>
        <div class="stat-item">
          <mat-icon>storage</mat-icon>
          <span>{{ getDatabaseAgentsCount() }} com acesso ao DB</span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './agent-graph.component.scss'
})
export class AgentGraphFixedComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() agents: Agent[] = [];
  @Input() loading = false;
  
  private svg: any;
  private simulation: any;
  nodes: GraphNode[] = [];
  links: GraphLink[] = [];
  private width = 1000;
  private height = 700;
  private graphContainerElement: HTMLElement | null = null;
  
  ngOnInit() {
    this.prepareGraphData();
  }
  
  ngOnChanges() {
    if (this.agents.length > 0) {
      this.prepareGraphData();
      setTimeout(() => {
        this.createGraph();
      }, 100);
    }
  }
  
  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    console.log('Agents length:', this.agents.length);
    
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      this.graphContainerElement = document.querySelector('.graph-svg-container');
      console.log('Graph container element:', this.graphContainerElement);
      
      if (this.agents.length > 0 && this.graphContainerElement) {
        console.log('Creating graph...');
        this.createGraph();
      } else {
        console.warn('Cannot create graph - Agents:', this.agents.length, 'Container:', !!this.graphContainerElement);
      }
    }, 1000);
  }
  
  ngOnDestroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
  }
  
  private prepareGraphData() {
    console.log('Preparing graph data with agents:', this.agents.length);
    
    // Criar nós para cada agente
    this.nodes = this.agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      canCommunicateWith: agent.canCommunicateWith || []
    }));
    
    // Criar links baseados nas conexões - VALIDAR EXISTÊNCIA DOS AGENTES
    this.links = [];
    const agentIds = new Set(this.agents.map(agent => agent.id));
    
    this.agents.forEach(agent => {
      if (agent.canCommunicateWith) {
        agent.canCommunicateWith.forEach(targetId => {
          // Só criar link se o agente de destino existe
          if (agentIds.has(targetId)) {
            this.links.push({
              source: agent.id,
              target: targetId,
              type: 'communication'
            });
          } else {
            console.warn(`Agent ${targetId} not found for communication with ${agent.name}`);
          }
        });
      }
      
      // Adicionar link para banco de dados se o agente tem acesso
      if (agent.databaseAccess?.enabled) {
        this.links.push({
          source: agent.id,
          target: 'database',
          type: 'database'
        });
      }
    });
    
    // Adicionar nó do banco de dados se necessário
    const hasDatabaseAccess = this.agents.some(agent => agent.databaseAccess?.enabled);
    if (hasDatabaseAccess) {
      this.nodes.push({
        id: 'database',
        name: 'Database',
        description: 'Banco de dados compartilhado',
        status: 'active',
        canCommunicateWith: []
      });
    }
    
    console.log('Graph data prepared:', {
      nodes: this.nodes.length,
      links: this.links.length,
      nodeIds: this.nodes.map(n => n.id),
      linkSources: this.links.map(l => l.source),
      linkTargets: this.links.map(l => l.target)
    });
  }
  
  private createGraph() {
    if (!this.graphContainerElement) {
      console.warn('Graph container element not found');
      return;
    }
    
    try {
      // Limpar SVG existente
      d3.select(this.graphContainerElement).selectAll('*').remove();
    
      // Configurar dimensões
      const container = this.graphContainerElement;
      this.width = container.offsetWidth || 1000;
      this.height = container.offsetHeight || 700;
      
      // Criar SVG
      this.svg = d3.select(this.graphContainerElement)
        .append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('viewBox', [0, 0, this.width, this.height])
        .style('background', '#1a1a1a')
        .style('border-radius', '8px');
      
      // Adicionar padrão de grade
      this.addGridPattern();
      
      // Validar links antes de criar simulação
      const validLinks = this.links.filter(link => {
        const sourceExists = this.nodes.some(node => node.id === link.source);
        const targetExists = this.nodes.some(node => node.id === link.target);
        if (!sourceExists || !targetExists) {
          console.warn(`Invalid link: ${link.source} -> ${link.target}`);
        }
        return sourceExists && targetExists;
      });
      
      console.log(`Using ${validLinks.length} valid links out of ${this.links.length}`);
      
      // Se não há nós, não criar simulação
      if (this.nodes.length === 0) {
        console.warn('No nodes to create graph');
        return;
      }
      
      // Criar simulação de força
      this.simulation = d3.forceSimulation(this.nodes)
        .force('link', validLinks.length > 0 ? d3.forceLink(validLinks).id((d: any) => d.id).distance(200) : null)
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(this.width / 2, this.height / 2))
        .force('collision', d3.forceCollide().radius(80))
        .force('x', d3.forceX(this.width / 2).strength(0.1))
        .force('y', d3.forceY(this.height / 2).strength(0.1));
      
      // Criar links apenas se houver links válidos
      let link: any;
      if (validLinks.length > 0) {
        console.log('Creating links with data:', validLinks);
        link = this.svg.append('g')
          .attr('class', 'links')
          .selectAll('line')
          .data(validLinks)
          .enter().append('line')
          .attr('class', (d: any) => `link link-${d.type}`)
          .style('stroke', (d: any) => d.type === 'communication' ? '#4CAF50' : '#FF9800')
          .style('stroke-width', 3)
          .style('stroke-dasharray', (d: any) => d.type === 'communication' ? '8,4' : 'none')
          .style('opacity', 0.9)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
        
        console.log('Links created:', link.size());
      } else {
        console.log('No valid links to create');
        link = this.svg.append('g').attr('class', 'links');
      }
      
      // Criar nós
      const node = this.svg.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(this.nodes)
        .enter().append('g')
        .attr('class', 'node')
        .call(this.drag());
      
      // Adicionar círculos aos nós
      node.append('circle')
        .attr('r', 40)
        .style('fill', (d: any) => this.getNodeColor(d))
        .style('stroke', (d: any) => d.status === 'active' ? '#4CAF50' : '#757575')
        .style('stroke-width', 4)
        .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))');
      
      // Adicionar ícones aos nós
      node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('fill', 'white')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text((d: any) => this.getNodeIcon(d));
      
      // Adicionar labels
      node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '50px')
        .style('fill', '#ffffff')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text((d: any) => d.name);
      
      // Adicionar tooltips
      node.append('title')
        .text((d: any) => `${d.name}\n${d.description}\nStatus: ${d.status}`);
      
      // Atualizar posições durante a simulação
      this.simulation.on('tick', () => {
        if (validLinks.length > 0) {
          link
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y);
        }
        
        node
          .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });
      
      // Adicionar animação de pulsação para links ativos
      if (validLinks.length > 0) {
        link
          .filter((d: any) => d.type === 'communication')
          .style('animation', 'pulse 3s ease-in-out infinite');
      }
        
      console.log('Graph created successfully');
    } catch (error) {
      console.error('Error creating graph:', error);
    }
  }
  
  private addGridPattern() {
    const defs = this.svg.append('defs');
    
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 30)
      .attr('height', 30)
      .attr('patternUnits', 'userSpaceOnUse');
    
    pattern.append('circle')
      .attr('cx', 15)
      .attr('cy', 15)
      .attr('r', 1)
      .style('fill', '#444444')
      .style('opacity', 0.3);
    
    this.svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#grid)');
  }
  
  private getNodeColor(node: GraphNode): string {
    if (node.id === 'database') return '#FF9800';
    return node.status === 'active' ? '#2196F3' : '#757575';
  }
  
  private getNodeIcon(node: GraphNode): string {
    if (node.id === 'database') return '🗄️';
    return '🤖';
  }
  
  private drag() {
    return d3.drag()
      .on('start', (event: any, d: any) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: any, d: any) => {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }
  
  onRefresh() {
    if (this.agents.length > 0) {
      this.prepareGraphData();
      setTimeout(() => {
        this.createGraph();
      }, 200);
    }
  }
  
  onResetLayout() {
    if (this.simulation) {
      this.simulation.alpha(1).restart();
    }
  }
  
  getDatabaseAgentsCount(): number {
    return this.agents.filter(agent => agent.databaseAccess?.enabled).length;
  }
}
