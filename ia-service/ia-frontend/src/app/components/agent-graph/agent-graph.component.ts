import { Component, Input, OnInit, OnDestroy, OnChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
  selector: 'app-agent-graph',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './agent-graph.component.html',
  styleUrl: './agent-graph.component.scss'
})
export class AgentGraphComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() agents: Agent[] = [];
  @Input() loading = false;
  
  @ViewChild('graphContainer', { static: false }) graphContainer!: ElementRef;
  
  private svg: any;
  private simulation: any;
  nodes: GraphNode[] = [];
  links: GraphLink[] = [];
  private width = 800;
  private height = 600;
  
  ngOnInit() {
    this.prepareGraphData();
  }
  
  ngOnChanges() {
    if (this.agents.length > 0) {
      this.prepareGraphData();
      setTimeout(() => {
        if (this.graphContainer) {
          this.createGraph();
        }
      }, 100);
    }
  }
  
  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    console.log('Agents length:', this.agents.length);
    console.log('Graph container:', this.graphContainer);
    
    // Aguardar um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      console.log('After timeout - Agents:', this.agents.length, 'Container:', !!this.graphContainer);
      if (this.agents.length > 0 && this.graphContainer) {
        console.log('Creating graph...');
        this.createGraph();
      } else {
        console.warn('Cannot create graph - Agents:', this.agents.length, 'Container:', !!this.graphContainer);
      }
    }, 1000);
  }
  
  ngOnDestroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
  }
  
  private prepareGraphData() {
    // Criar nós para cada agente
    this.nodes = this.agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      canCommunicateWith: agent.canCommunicateWith || []
    }));
    
    // Criar links baseados nas conexões
    this.links = [];
    this.agents.forEach(agent => {
      if (agent.canCommunicateWith) {
        agent.canCommunicateWith.forEach(targetId => {
          this.links.push({
            source: agent.id,
            target: targetId,
            type: 'communication'
          });
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
  }
  
  private createGraph() {
    if (!this.graphContainer) {
      console.warn('Graph container not found');
      return;
    }
    
    try {
      // Limpar SVG existente
      d3.select(this.graphContainer.nativeElement).selectAll('*').remove();
    
    // Configurar dimensões
    const container = this.graphContainer.nativeElement;
    this.width = container.offsetWidth || 1000;
    this.height = container.offsetHeight || 700;
    
    // Criar SVG
    this.svg = d3.select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height])
      .style('background', '#1a1a1a')
      .style('border-radius', '8px');
    
    // Adicionar padrão de grade
    this.addGridPattern();
    
    // Criar simulação de força
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id((d: any) => d.id).distance(200))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(80))
      .force('x', d3.forceX(this.width / 2).strength(0.1))
      .force('y', d3.forceY(this.height / 2).strength(0.1));
    
    // Criar links
    const link = this.svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter().append('line')
      .attr('class', (d: any) => `link link-${d.type}`)
      .style('stroke', (d: any) => d.type === 'communication' ? '#4CAF50' : '#FF9800')
      .style('stroke-width', 3)
      .style('stroke-dasharray', (d: any) => d.type === 'communication' ? '8,4' : 'none')
      .style('opacity', 0.9)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
    
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
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      
      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
    
    // Adicionar animação de pulsação para links ativos
    link.filter((d: any) => d.type === 'communication')
      .style('animation', 'pulse 3s ease-in-out infinite');
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
        if (this.graphContainer) {
          this.createGraph();
        } else {
          console.warn('Graph container still not found on refresh');
        }
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
