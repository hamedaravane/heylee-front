import {Component, inject, OnInit} from "@angular/core";
import {AsyncPipe} from "@angular/common";
import {NzSkeletonModule} from "ng-zorro-antd/skeleton";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {RouterLink} from "@angular/router";
import {NzButtonModule} from "ng-zorro-antd/button";
import {SupplierFacade} from "../../data-access/supplier.facade";

@Component({
  standalone: true,
  selector: 'suppliers',
  templateUrl: 'suppliers.component.html',
  imports: [
    AsyncPipe,
    NzSkeletonModule,
    NzEmptyModule,
    NzButtonModule,
    RouterLink
  ]
})
export class SuppliersComponent implements OnInit {
  private readonly supplierFacade = inject(SupplierFacade);
  suppliers$ = this.supplierFacade.suppliers$;

  ngOnInit() {
    this.supplierFacade.loadSuppliers();
  }

  editSupplier(id: number) {

  }

  deleteSupplier(id: number) {

  }
}
