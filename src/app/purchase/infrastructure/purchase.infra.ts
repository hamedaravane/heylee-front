import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {PurchaseDTO} from '@purchase/entity/purchase.entity';
import {HttpClient} from '@angular/common/http';
import {environment} from '@environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseInfra {
  private readonly http = inject(HttpClient);
  createPurchase(purchase: PurchaseDTO): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/purchases-invoice/create`, purchase);
  }
}
