import {Routes} from '@angular/router';
import {MainComponent} from './component/main/main.component';
import {WelcomeComponent} from './component/welcome/welcome.component';
import {AuthGuard} from '@auth/guards/auth.guard';

export const mainRoutes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: WelcomeComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'login',
        loadComponent: () => import('../auth/component/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'sale',
        loadComponent: () => import('../sale/component/invoice/sale-invoice.component').then(c => c.SaleInvoiceComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'invoices',
        loadComponent: () => import('../sale/component/invoice-list/invoice-list.component').then(c => c.InvoiceListComponent),
        canActivate: [AuthGuard],
        children: [
          {
            path: ':id',
            loadComponent: () => import('../sale/component/invoice-item/invoice-item.component').then(c => c.InvoiceItemComponent),
            canActivate: [AuthGuard],
          }
        ]
      },
      {
        path: 'purchase',
        loadComponent: () => import('../purchase/component/invoice/purchase-invoice.component').then(c => c.PurchaseInvoiceComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'inventory',
        loadComponent: () => import('../inventory/component/report/inventory-report.component').then(c => c.InventoryReportComponent),
        canActivate: [AuthGuard]
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];
