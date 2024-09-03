import {Injectable} from '@angular/core';
import {CreateSupplierDto, mapSupplierDtoToSupplier, Supplier, SupplierDto} from '../entity/supplier.entity';
import {Observable} from 'rxjs';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {toSnakeCase} from '@shared/entity/utility.entity';
import {BaseInfra} from '@shared/service/base.infra';

@Injectable({
  providedIn: 'root',
})
export class SupplierInfra extends BaseInfra {
  createSupplier(supplier: CreateSupplierDto): Observable<Supplier> {
    return this.createEntity<CreateSupplierDto, SupplierDto, Supplier>(
      'supplier/create',
      supplier,
      mapSupplierDtoToSupplier,
      toSnakeCase
    )
  }

  editSupplier(id: number, supplier: CreateSupplierDto): Observable<Supplier> {
    return this.updateEntity<CreateSupplierDto, SupplierDto, Supplier>(
      'supplier',
      id,
      supplier,
      mapSupplierDtoToSupplier,
      toSnakeCase
    );
  }

  fetchSuppliers(pageIndex: number = 1): Observable<IndexResponse<Supplier>> {
    return this.fetchEntities<SupplierDto, Supplier>(
      'supplier/index',
      mapSupplierDtoToSupplier,
      pageIndex
    );
  }

  deleteSupplier(id: number): Observable<void> {
    return this.deleteEntity<SupplierDto>(
      'supplier',
      id,
    );
  }
}
