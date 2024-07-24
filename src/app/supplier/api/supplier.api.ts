import {inject, Injectable} from '@angular/core';
import {SupplierFacade} from '@supplier/data-access/supplier.facade';
import {Observable} from 'rxjs';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {Supplier} from '@supplier/entity/supplier.entity';

@Injectable({
  providedIn: 'root'
})
export class SupplierApi {
  private readonly supplierFacade = inject(SupplierFacade);
  private isFetched = false;

  get suppliers$(): Observable<IndexResponse<Supplier>> {
    if (!this.isFetched) {
      this.supplierFacade.loadSuppliers().then(() => {
        this.isFetched = true;
      });
      return this.supplierFacade.suppliersIndex$;
    }
    return this.supplierFacade.suppliersIndex$;
  }
}
