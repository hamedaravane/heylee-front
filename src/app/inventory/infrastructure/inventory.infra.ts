import { inject, Injectable } from '@angular/core';
import { StockItem, StockItemDto } from '@inventory/entity/inventory.entity';
import { toCamelCase } from '@shared/entity/utility.entity';
import { HttpClient, HttpParams } from '@angular/common/http';
import { dtoConvertor, ServerResponse } from '@shared/entity/server-response.entity';
import { environment } from '@environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryInfra {
  private readonly http = inject(HttpClient);

  fetchAvailableProducts(pageIndex: number = 1) {
    const params = new HttpParams().set('page', pageIndex).append('per-page', 100);
    return this.http
      .get<ServerResponse<StockItemDto[]>>(`${environment.apiUrl}/inventory/available-products`, { params })
      .pipe(
        map(res => {
          if (res.ok) {
            return res.result.map(item => dtoConvertor(item, toCamelCase<StockItemDto, StockItem>));
          } else {
            throw res.result as unknown;
          }
        })
      );
  }
}
