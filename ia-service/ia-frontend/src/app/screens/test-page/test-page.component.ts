import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-test-page',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div style="padding: 2rem; text-align: center;">
      <mat-card>
        <mat-card-content>
          <h1>🎉 Página de Teste Funcionando!</h1>
          <p>Se você está vendo esta página, a navegação está funcionando corretamente.</p>
          <button mat-raised-button color="primary" routerLink="/dashboard">
            <mat-icon>arrow_back</mat-icon>
            Voltar ao Dashboard
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class TestPageComponent {}
