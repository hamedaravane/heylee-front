import {inject, Injectable} from '@angular/core';
import {InventoryInfra} from '@inventory/infrastructure/inventory.infra';
import {BehaviorSubject, filter, firstValueFrom} from 'rxjs';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ServerError} from '@shared/entity/server-response.entity';
import {StockItem} from '@inventory/entity/inventory.entity';

@Injectable({
  providedIn: 'root'
})
export class InventoryFacade {
  private readonly inventoryInfra = inject(InventoryInfra);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly availableProductsSubject = new BehaviorSubject<StockItem[] | null>(null);

  get availableProducts$() {
    return this.availableProductsSubject.asObservable().pipe(filter(Boolean));
  }

  async fetchAvailableProducts() {
    try {
      const response = await firstValueFrom(this.inventoryInfra.fetchAvailableProducts());
      this.availableProductsSubject.next(response);
    } catch (e) {
      const error = e as ServerError;
      console.error(error.error.result);
      this.nzMessageService.error(error.error.result.message);
    }
  }
}
