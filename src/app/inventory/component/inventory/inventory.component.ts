import {Component, inject, OnInit} from '@angular/core';
import {InventoryFacade} from '@inventory/data-access/inventory.facade';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {AsyncPipe, DecimalPipe, NgOptimizedImage} from '@angular/common';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';

@Component({
  selector: 'inventory-inventory',
  templateUrl: './inventory.component.html',
  imports: [
    PageContainerComponent,
    CardContainerComponent,
    NzEmptyModule,
    AsyncPipe,
    NgOptimizedImage,
    NzSkeletonModule,
    DecimalPipe
  ],
  standalone: true
})
export class InventoryComponent implements OnInit {
  private readonly inventoryFacade = inject(InventoryFacade);
  availableProducts$ = this.inventoryFacade.availableProducts$;

  ngOnInit() {
    this.inventoryFacade.fetchAvailableProducts().then();
  }
}
