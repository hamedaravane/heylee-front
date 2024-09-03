import {inject, Injectable} from '@angular/core';
import {SupplierInfra} from '../infrastructure/supplier.infra';
import {BehaviorSubject, filter, firstValueFrom, Subject} from 'rxjs';
import {CreateSupplier, CreateSupplierDto, Supplier} from '../entity/supplier.entity';
import {IndexResponse} from '@shared/entity/server-response.entity';
import {BaseFacade} from "@shared/service/base.facade";
import {toSnakeCase} from "@shared/entity/utility.entity";

@Injectable({
  providedIn: 'root'
})
export class SupplierFacade extends BaseFacade {
  private readonly supplierInfra = inject(SupplierInfra);
  private readonly supplierSubject = new Subject<Supplier>();
  private readonly suppliersIndexSubject = new BehaviorSubject<IndexResponse<Supplier> | null>(null);


  get supplier$() {
    return this.supplierSubject.asObservable();
  };

  get suppliersIndex$() {
    return this.suppliersIndexSubject.asObservable().pipe(filter(Boolean));
  };

  async loadSuppliers() {
    await this.loadEntity(
      this.suppliersIndexSubject,
      () => firstValueFrom(this.supplierInfra.fetchSuppliers()),
      undefined,
      true
    )
  }

  async createSupplier(supplier: CreateSupplierDto): Promise<void> {
    await this.loadEntity(
      this.supplierSubject,
      () => firstValueFrom(this.supplierInfra.createSupplier(supplier)),
      () => this.loadSuppliers()
    )
  }

  async editSupplier(id: number, supplier: CreateSupplier) {
    const dto: CreateSupplierDto = toSnakeCase(supplier);
    await this.loadEntity(
      this.supplierSubject,
      () => firstValueFrom(this.supplierInfra.editSupplier(id, dto)),
      () => this.loadSuppliers()
    )
  }

  async deleteSupplier(id: number) {
    await this.deleteEntity(
      () => firstValueFrom(this.supplierInfra.deleteSupplier(id)),
      () => this.loadSuppliers()
    );
  }
}
