import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom, Observable, Subject} from 'rxjs';
import {
  CreatePurchaseInvoice,
  CreatePurchaseInvoiceDTO,
  mapCreatePurchaseInvoiceToDTO,
  PurchaseInvoice
} from '@purchase/entity/purchase.entity';
import {PurchaseInfra} from '@purchase/infrastructure/purchase.infra';
import {NzMessageService} from 'ng-zorro-antd/message';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {FilterIndex} from "@shared/entity/common.entity";

@Injectable({
  providedIn: 'root'
})
export class PurchaseFacade {
  private readonly purchaseInfra = inject(PurchaseInfra);
  private readonly nzMessageService = inject(NzMessageService);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly purchaseInvoicesSubject = new Subject<IndexResponse<PurchaseInvoice>>();

  get purchaseInvoices$(): Observable<IndexResponse<PurchaseInvoice>> {
    return this.purchaseInvoicesSubject.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  async fetchPurchaseInvoices(pageIndex: number = 1, filter?: FilterIndex<PurchaseInvoice>) {
    this.loadingSubject.next(true);
    try {
      const response = await firstValueFrom(this.purchaseInfra.fetchPurchaseInvoices(pageIndex, filter));
      this.purchaseInvoicesSubject.next(response);
    } catch (e) {
      const err = e as Error;
      console.error('Purchase creation failed:', err.message);
      this.nzMessageService.error(err.message);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createPurchase(purchase: CreatePurchaseInvoice): Promise<void> {
    const purchaseDTO: CreatePurchaseInvoiceDTO = mapCreatePurchaseInvoiceToDTO(purchase);
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
