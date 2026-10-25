import { Routes } from '@angular/router';
import { roleGuard } from './core/guards';
import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { BusinessDetailComponent } from './pages/business/business-detail.component';
import { HomeComponent } from './pages/home/home.component';
import { BusinessFormComponent } from './pages/owner/business-form.component';
import { OwnerDashboardComponent } from './pages/owner/owner-dashboard.component';
import { WallComponent } from './pages/wall/wall.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'wall', component: WallComponent },
  { path: 'business/:id', component: BusinessDetailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'owner', component: OwnerDashboardComponent, canActivate: [roleGuard('OWNER')] },
  { path: 'owner/business/new', component: BusinessFormComponent, canActivate: [roleGuard('OWNER')] },
  { path: 'owner/business/:id/edit', component: BusinessFormComponent, canActivate: [roleGuard('OWNER')] },
  { path: 'admin', component: AdminComponent, canActivate: [roleGuard('ADMIN')] },
  { path: '**', redirectTo: '' },
];
