import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Agent, AgentService } from '../../services/agent.service';

@Component({
  selector: 'app-agent-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './agent-form.component.html',
  styleUrl: './agent-form.component.scss'
})
export class AgentFormComponent implements OnInit {
  @Input() agent: Agent | null = null;
  @Input() isVisible = false;
  @Input() availableAgents: Agent[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Agent>>();
  
  agentForm: FormGroup;
  isEditMode = false;
  availableCollections: string[] = [];
  
  // Opções para selects
  statusOptions = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' }
  ];
  
  operationOptions = [
    { value: 'read', label: 'Leitura' },
    { value: 'write', label: 'Escrita' },
    { value: 'update', label: 'Atualização' },
    { value: 'delete', label: 'Exclusão' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private agentService: AgentService
  ) {
    this.agentForm = this.createForm();
  }
  
  ngOnInit() {
    if (this.agent) {
      this.isEditMode = true;
      this.populateForm();
    }
    this.loadAvailableCollections();
  }
  
  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['active', Validators.required],
      canCommunicateWith: [[]],
      databaseAccess: this.fb.group({
        enabled: [false],
        allowedCollections: [[]],
        allowedOperations: [[]],
        queryLimits: this.fb.group({
          maxResults: [50, [Validators.required, Validators.min(1), Validators.max(1000)]],
          timeout: [30000, [Validators.required, Validators.min(1000), Validators.max(300000)]]
        })
      })
    });
  }
  
  populateForm() {
    if (this.agent) {
      this.agentForm.patchValue({
        name: this.agent.name,
        description: this.agent.description,
        status: this.agent.status,
        canCommunicateWith: this.agent.canCommunicateWith || [],
        databaseAccess: {
          enabled: this.agent.databaseAccess?.enabled || false,
          allowedCollections: this.agent.databaseAccess?.allowedCollections || [],
          allowedOperations: this.agent.databaseAccess?.allowedOperations || [],
          queryLimits: {
            maxResults: this.agent.databaseAccess?.queryLimits?.maxResults || 50,
            timeout: this.agent.databaseAccess?.queryLimits?.timeout || 30000
          }
        }
      });
    }
  }
  
  onSave() {
    if (this.agentForm.valid) {
      const formValue = this.agentForm.value;
      const agentData: Partial<Agent> = {
        ...formValue,
        id: this.agent?.id
      };
      
      this.save.emit(agentData);
    } else {
      this.markFormGroupTouched();
    }
  }
  
  onCancel() {
    this.close.emit();
  }
  
  onDatabaseAccessToggle() {
    const databaseAccess = this.agentForm.get('databaseAccess');
    const enabled = databaseAccess?.get('enabled')?.value;
    
    if (!enabled) {
      databaseAccess?.patchValue({
        allowedCollections: [],
        allowedOperations: []
      });
    }
  }
  
  private markFormGroupTouched() {
    Object.keys(this.agentForm.controls).forEach(key => {
      const control = this.agentForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          const nestedControl = control.get(nestedKey);
          nestedControl?.markAsTouched();
          
          if (nestedControl instanceof FormGroup) {
            Object.keys(nestedControl.controls).forEach(deepKey => {
              nestedControl.get(deepKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }
  
  getFieldError(fieldName: string): string {
    const field = this.agentForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo é obrigatório';
      if (field.errors['minlength']) return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
    }
    return '';
  }
  
  getNestedFieldError(groupName: string, fieldName: string): string {
    const group = this.agentForm.get(groupName);
    const field = group?.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo é obrigatório';
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
    }
    return '';
  }
  
  getAvailableAgentsForCommunication(): Agent[] {
    if (this.isEditMode && this.agent) {
      // Em modo de edição, excluir o próprio agente da lista
      return this.availableAgents.filter(a => a.id !== this.agent?.id);
    }
    return this.availableAgents;
  }
  
  getFormTitle(): string {
    return this.isEditMode ? 'Editar Agente' : 'Criar Novo Agente';
  }
  
  getSaveButtonText(): string {
    return this.isEditMode ? 'Salvar Alterações' : 'Criar Agente';
  }

  loadAvailableCollections(): void {
    this.agentService.getAvailableCollections().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableCollections = response.data;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar collections disponíveis:', error);
        // Fallback para collections padrão em caso de erro
        this.availableCollections = ['users', 'products', 'orders', 'metadados', 'logs'];
      }
    });
  }

  getCollectionDisplayName(collection: string): string {
    const displayNames: { [key: string]: string } = {
      'users': 'Usuários',
      'products': 'Produtos',
      'orders': 'Pedidos',
      'metadados': 'Metadados',
      'logs': 'Logs',
      'agents': 'Agentes',
      'fileuploads': 'Uploads de Arquivos',
      'communications': 'Comunicações'
    };
    
    return displayNames[collection] || collection.charAt(0).toUpperCase() + collection.slice(1);
  }
}