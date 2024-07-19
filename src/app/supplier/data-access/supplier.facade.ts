import {inject, Injectable} from "@angular/core";
import {SupplierInfra} from "../infrastructure/supplier.infra";
import {firstValueFrom, Subject} from "rxjs";
import {Supplier} from "../entity/supplier.entity";

@Injectable({
  providedIn: 'root'
})
export class SupplierFacade {
  private readonly supplierInfra = inject(SupplierInfra);
  private readonly supplierResponseSubject = new Subject<Supplier>();

  get supplierResponse$() {
    return this.supplierResponseSubject.asObservable()
  };

  async loadSuppliers() {
    try {
      const suppliers = await firstValueFrom(this.supplierInfra.getSuppliers());
      this.supplierResponseSubject.next(suppliers);
    } catch (error) {
      console.error('Error in SupplierFacade loadSuppliers:', error);
    }
  }

  async createSupplier(supplier: Supplier): Promise<void> {
    try {
      const newSupplier = await firstValueFrom(this.supplierInfra.createSupplier(supplier));
      this.supplierResponseSubject.next(newSupplier);
    } catch (error) {
      console.error('Error in SupplierFacade createSupplier:', error);
    }
  }
}
