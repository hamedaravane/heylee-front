import { Routes } from '@angular/router';
import { MainComponent } from './component/main/main.component';
import { WelcomeComponent } from './component/welcome/welcome.component';

export const mainRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MainComponent,
    children: [
      {
        path: '',
        component: WelcomeComponent
      },
      /*{
        path: 'product',
      },
      {
        path: 'order',
      },
      {
        path: 'payment',
      },
      {
        path: 'inventory',
      },
      {
        path: 'customer',
      },
      {
        path: 'report',
      },*/
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];