import { Injectable } from '@angular/core';
import { CreateSupplierDto, mapSupplierDtoToSupplier, Supplier, SupplierDto } from '../entity/supplier.entity';
import { Observable } from 'rxjs';
import { IndexResponse } from '@shared/entity/server-response.entity';
import { toSnakeCase } from '@shared/entity/utility.entity';
import { BaseInfra } from '@shared/service/base.infra';

@Injectable({
  providedIn: 'root'
})
export class SupplierInfra extends BaseInfra {
  private readonly endpoint = 'supplier';

  createSupplier(supplier: CreateSupplierDto): Observable<Supplier> {
    return this.createEntity<CreateSupplierDto, SupplierDto, Supplier>(
      this.endpoint,
      supplier,
      mapSupplierDtoToSupplier,
      toSnakeCase
    );
  }

  editSupplier(id: number, supplier: CreateSupplierDto): Observable<Supplier> {
    return this.updateEntity<CreateSupplierDto, SupplierDto, Supplier>(
      this.endpoint,
      id,
      supplier,
      mapSupplierDtoToSupplier,
      toSnakeCase
    );
  }

  fetchSuppliers(pageIndex: number = 1): Observable<IndexResponse<Supplier>> {
    return this.fetchEntities<SupplierDto, Supplier>(this.endpoint, mapSupplierDtoToSupplier, pageIndex);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.deleteEntity<SupplierDto>(this.endpoint, id);
  }
}
