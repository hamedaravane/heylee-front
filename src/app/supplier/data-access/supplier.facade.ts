import {inject, Injectable} from '@angular/core';
import {SupplierInfra} from '../infrastructure/supplier.infra';
import {firstValueFrom, Subject} from 'rxjs';
import {Supplier} from '../entity/supplier.entity';
import {IndexResponse} from '@shared/entity/server-response.entity';

@Injectable({
  providedIn: 'root'
})
export class SupplierFacade {
  private readonly supplierInfra = inject(SupplierInfra);
  private readonly supplierSubject = new Subject<Supplier>();
  private readonly suppliersIndexSubject = new Subject<IndexResponse<Supplier>>();

  get supplier$() {
    return this.supplierSubject.asObservable()
  };

  get suppliersIndex$() {
    return this.suppliersIndexSubject.asObservable()
  };

  async loadSuppliers() {
    try {
      const response = await firstValueFrom(this.supplierInfra.fetchSuppliers());
      this.suppliersIndexSubject.next(response);
    } catch (error) {
      console.error('Error in SupplierFacade loadSuppliers:', error);
    }
  }

  async createSupplier(supplier: Supplier): Promise<void> {
    try {
      const newSupplier = await firstValueFrom(this.supplierInfra.createSupplier(supplier));
      this.supplierSubject.next(newSupplier);
    } catch (error) {
      console.error('Error in SupplierFacade createSupplier:', error);
    }
  }

  async editSupplier(id: number, supplier: Supplier) {
    try {
      const response = await firstValueFrom(this.supplierInfra.editSupplier(id, supplier));
      this.supplierSubject.next(response);
    } catch (error) {
      console.error('Error in SupplierFacade editSupplier:', error);
    }
  }

  async deleteSupplier(id: number) {
    try {
      await firstValueFrom(this.supplierInfra.deleteSupplier(id));
    } catch (error) {
      console.error('Error in SupplierFacade deleteSupplier:', error);
    }
  }
}
