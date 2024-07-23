import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@environment';
import {dtoConvertor, ServerResponse} from '@shared/entity/server-response.entity';
import {StockItem, StockItemDto} from '@inventory/entity/inventory.entity';
import {map} from 'rxjs';
import {toCamelCase} from '@shared/entity/utility.entity';

@Injectable({
  providedIn: 'root'
})
export class InventoryInfra {
  private readonly http = inject(HttpClient);

  fetchAvailableProducts() {
    return this.http.get<ServerResponse<StockItemDto[]>>(`${environment.apiUrl}/inventory/available-products`)
      .pipe(map(res => {
        if (res.ok) {
          return res.result.map(item => dtoConvertor(item, toCamelCase<StockItemDto, StockItem>))
        } else {
          throw res.result as unknown
        }
      }))
  }
}
