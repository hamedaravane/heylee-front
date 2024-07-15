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
        path: 'sale',
        loadComponent: () => import('../sale/component/invoice/sale-invoice.component').then(c => c.SaleInvoiceComponent),
      },
      {
        path: 'purchase',
        loadComponent: () => import('../purchase/component/invoice/purchase-invoice.component').then(c => c.PurchaseInvoiceComponent),
      },
      {
        path: 'inventory',
        loadComponent: () => import('../inventory/component/report/inventory-report.component').then(c => c.InventoryReportComponent),
      }
    ]
  }
];
