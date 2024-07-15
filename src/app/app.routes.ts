import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { mainRoutes } from './main/main.routes';
import {AuthGuard} from "@auth/guards/auth.guard";

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    children: mainRoutes,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/component/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'user',
    redirectTo: ''
  },
  {
    path: '**',
    redirectTo: ''
  }
];
