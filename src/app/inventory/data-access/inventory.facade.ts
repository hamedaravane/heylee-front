import {inject, Injectable} from '@angular/core';
import {InventoryInfra} from '@inventory/infrastructure/inventory.infra';
import {firstValueFrom, Subject} from 'rxjs';
import {NzMessageService} from 'ng-zorro-antd/message';
import {ServerError} from '@shared/entity/server-response.entity';
import {StockItem} from '@inventory/entity/inventory.entity';

@Injectable({
  providedIn: 'root'
})
export class InventoryFacade {
  private readonly inventoryInfra = inject(InventoryInfra);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly availableProductsSubject = new Subject<StockItem[]>();
  isFetched = false;

  get availableProducts$() {
    return this.availableProductsSubject.asObservable();
  }

  async fetchAvailableProducts() {
    try {
      const response = await firstValueFrom(this.inventoryInfra.fetchAvailableProducts());
      this.isFetched = true;
      this.availableProductsSubject.next(response);
    } catch (e) {
      const error = e as ServerError;
      console.error(error.error.result);
      this.nzMessageService.error(error.error.result);
    }
  }
}
