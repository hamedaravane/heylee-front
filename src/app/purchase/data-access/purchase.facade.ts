import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Observable} from 'rxjs';
import {mapPurchaseToDTO, Purchase, PurchaseDTO} from '@purchase/entity/purchase.entity';
import {PurchaseInfra} from '@purchase/infrastructure/purchase.infra';
import {NzMessageService} from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class PurchaseFacade {
  private readonly purchaseInfra = inject(PurchaseInfra);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  async createPurchase(purchase: Purchase): Promise<void> {
    const purchaseDTO: PurchaseDTO = mapPurchaseToDTO(purchase);
    this.loadingSubject.next(true);
    try {
      await firstValueFrom(this.purchaseInfra.createPurchase(purchaseDTO));
      this.nzMessageService.success('سفارش با موفقیت ثبت شد. برای مشاهده به سفارشای خرید مراجعه کنین');
    } catch (e) {
      const err = e as Error;
      console.error('Purchase creation failed:', err.message);
      this.nzMessageService.error(err.message);
    } finally {
      this.loadingSubject.next(false);
    }
  }
}
