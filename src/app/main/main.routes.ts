import { Routes } from '@angular/router';
import { MainComponent } from './component/main/main.component';
import { WelcomeComponent } from './component/welcome/welcome.component';

export const mainRoutes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: WelcomeComponent
      },
      {
        path: 'product',
        loadComponent: () => import('../product/component/check-inventory/check-inventory.component').then(c => c.CheckInventoryComponent),
        children: [
          {
            path: ':code',
            loadComponent: () => import('../product/component/product-detail/product-detail.component').then(c => c.ProductDetailComponent)
          }
        ]
      },/*
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