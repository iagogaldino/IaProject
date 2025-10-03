import { Routes } from '@angular/router';
import { Dashboard } from './screens/dashboard/dashboard';
import { AgentGraphPageComponent } from './screens/agent-graph-page/agent-graph-page.component';
import { TestPageComponent } from './screens/test-page/test-page.component';
import { FileManagementComponent } from './screens/file-management/file-management.component';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'dashboard', component: Dashboard },
  { path: 'graph', component: AgentGraphPageComponent },
  { path: 'files', component: FileManagementComponent },
  { path: 'test', component: TestPageComponent },
  { path: '**', redirectTo: '' }
];