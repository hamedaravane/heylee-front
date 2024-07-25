import {inject, Injectable} from '@angular/core';
import {InventoryInfra} from '@inventory/infrastructure/inventory.infra';
import {BehaviorSubject, filter, firstValueFrom} from 'rxjs';
import {NzMessageService} from 'ng-zorro-antd/message';
import {StockItem} from '@inventory/entity/inventory.entity';
import {ServerResponseError} from "@shared/entity/server-response.entity";

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
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    }
  }
}
