import {inject, Injectable} from '@angular/core';
import {SupplierInfra} from '../infrastructure/supplier.infra';
import {BehaviorSubject, filter, firstValueFrom, Subject} from 'rxjs';
import {CreateSupplierDto, Supplier} from '../entity/supplier.entity';
import {IndexResponse, ServerResponseError} from '@shared/entity/server-response.entity';
import {NzMessageService} from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class SupplierFacade {
  private readonly nzMessageService = inject(NzMessageService);
  private readonly supplierInfra = inject(SupplierInfra);
  private readonly supplierSubject = new Subject<Supplier>();
  private readonly suppliersIndexSubject = new BehaviorSubject<IndexResponse<Supplier> | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  get loading$() {
    return this.loadingSubject.asObservable();
  }

  get supplier$() {
    return this.supplierSubject.asObservable();
  };

  get suppliersIndex$() {
    return this.suppliersIndexSubject.asObservable().pipe(filter(Boolean));
  };

  async loadSuppliers() {
    this.loadingSubject.next(true);
    try {
      const response = await firstValueFrom(this.supplierInfra.fetchSuppliers());
      this.suppliersIndexSubject.next(response);
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createSupplier(supplier: CreateSupplierDto): Promise<void> {
    this.loadingSubject.next(true);
    try {
      const newSupplier = await firstValueFrom(this.supplierInfra.createSupplier(supplier));
      this.supplierSubject.next(newSupplier);
      this.nzMessageService.success('Supplier created successfully');
      await this.loadSuppliers();
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async editSupplier(id: number, supplier: CreateSupplierDto) {
    this.loadingSubject.next(true);
    try {
      const response = await firstValueFrom(this.supplierInfra.editSupplier(id, supplier));
      this.supplierSubject.next(response);
      this.nzMessageService.success('Supplier edited successfully');
      await this.loadSuppliers();
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteSupplier(id: number) {
    this.loadingSubject.next(true);
    try {
      const response = await firstValueFrom(this.supplierInfra.deleteSupplier(id));
      this.supplierSubject.next(response);
      this.nzMessageService.success('Supplier deleted successfully');
      await this.loadSuppliers();
    } catch (err) {
      const error = new ServerResponseError(err);
      if (error.status !== 422) {
        console.error(error.res);
        this.nzMessageService.error(error.res.message);
      } else {
        console.error(error.validationErrors);
        throw error.validationErrors;
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }
}
