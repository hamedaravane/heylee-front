import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Subject } from 'rxjs';
import { mapPurchaseToDTO, Purchase, PurchaseDTO } from '@purchase/entity/purchase.entity';
import { PurchaseInfra } from '@purchase/infrastructure/purchase.infra';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class PurchaseFacade {
  private readonly purchaseInfra = inject(PurchaseInfra);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly purchaseSubject = new Subject<Purchase>();

  get purchase$() {
    return this.purchaseSubject.asObservable();
  }

  async createPurchase(purchase: Purchase): Promise<void> {
    const purchaseDTO: PurchaseDTO = mapPurchaseToDTO(purchase);
    try {
      const response = await firstValueFrom(this.purchaseInfra.createPurchase(purchaseDTO));
    } catch (e) {
      const err = e as Error;
      console.error('Purchase creation failed:', err.message);
      this.nzMessageService.error(err.message);
    }
  }
}