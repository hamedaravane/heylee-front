import { Component, inject } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { NzCheckboxGroupComponent } from 'ng-zorro-antd/checkbox';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';
import { NzSkeletonComponent } from 'ng-zorro-antd/skeleton';
import { SaleFacade } from '@sale/data-access/sale.facade';

@Component({
  standalone: true,
  selector: 'sale-invoice-item',
  templateUrl: './invoice-item.component.html',
  imports: [
    AsyncPipe,
    DecimalPipe,
    NzCheckboxGroupComponent,
    NzDividerComponent,
    NzEmptyComponent,
    NzPaginationComponent,
    NzSkeletonComponent
  ]
})
export class InvoiceItemComponent {
  private readonly saleFacade = inject(SaleFacade);
  invoiceItem$ = this.saleFacade.invoice$;
}