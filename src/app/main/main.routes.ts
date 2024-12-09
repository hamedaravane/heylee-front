import { Routes } from '@angular/router';
import { MainComponent } from './component/main/main.component';
import { WelcomeComponent } from './component/welcome/welcome.component';
import { AuthGuard } from '@auth/guards/auth.guard';

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
        loadComponent: () => import('../auth/component/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'sale',
        loadComponent: () =>
          import('../sale/component/invoice/sale-invoice.component').then(c => c.SaleInvoiceComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('../sale/component/invoice-list/invoice-list.component').then(c => c.InvoiceListComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'purchase',
        loadComponent: () =>
          import('../purchase/component/invoice/purchase-invoice.component').then(c => c.PurchaseInvoiceComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('@inventory/component/inventory/inventory.component').then(c => c.InventoryComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'inventory/story-creator',
        loadComponent: () =>
          import('@inventory/component/story-generator/story-generator.component').then(c => c.StoryGeneratorComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'supplier',
        loadComponent: () =>
          import('../supplier/component/suppliers/suppliers.component').then(c => c.SuppliersComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'customer',
        loadComponent: () =>
          import('../customer/component/customers/customers.component').then(c => c.CustomersComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'product',
        loadComponent: () => import('../product/component/products/products.component').then(c => c.ProductsComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'purchase-receipt',
        loadComponent: () =>
          import('../purchase/component/purchase-receipt/purchase-receipt.component').then(
            c => c.PurchaseReceiptComponent
          ),
        canActivate: [AuthGuard]
      },
      {
        path: 'transaction',
        loadComponent: () => import('../transaction/component/transaction.component').then(c => c.TransactionComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'statistic',
        loadComponent: () => import('../statistic/component/statistic.component').then(c => c.StatisticComponent),
        canActivate: [AuthGuard]
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];
