import {Routes} from "@angular/router";

export const orderRoutes: Routes = [
  {
    path: 'cart',
    loadComponent: () => import('./component/cart/cart.component').then(c => c.CartComponent),
  }
]
