import {Component, inject, OnInit} from "@angular/core";
import {AsyncPipe} from "@angular/common";
import {NzSkeletonModule} from "ng-zorro-antd/skeleton";
import {NzEmptyModule} from "ng-zorro-antd/empty";
import {RouterLink} from "@angular/router";
import {NzButtonModule} from "ng-zorro-antd/button";
import {SupplierFacade} from "../../data-access/supplier.facade";
import {Supplier} from "../../entity/supplier.entity";
import {BidiModule} from "@angular/cdk/bidi";
import {NzDrawerModule} from "ng-zorro-antd/drawer";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzAutosizeDirective, NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";

@Component({
  standalone: true,
  selector: 'suppliers',
  templateUrl: 'suppliers.component.html',
  imports: [
    AsyncPipe,
    BidiModule,
    NzDrawerModule,
    NzFormModule,
    NzSkeletonModule,
    NzEmptyModule,
    NzButtonModule,
    RouterLink,
    ReactiveFormsModule,
    NzInputDirective,
    NzInputGroupComponent,
    NzAutosizeDirective
  ]
})
export class SuppliersComponent implements OnInit {
  private readonly supplierFacade = inject(SupplierFacade);
  suppliersIndex$ = this.supplierFacade.suppliersIndex$;
  isAddSupplierVisible = false;

  createSupplierForm = new FormGroup({
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    telegram: new FormControl(''),
    instagram: new FormControl(''),
  })

  ngOnInit() {
    this.supplierFacade.loadSuppliers().then();
  }

  editSupplier(id: number, supplier: Supplier) {
    this.supplierFacade.editSupplier(id, supplier).then();
  }

  createSupplier() {
  }

  deleteSupplier(id: number) {
    this.supplierFacade.deleteSupplier(id).then();
  }

  closeAddSupplier() {
    this.isAddSupplierVisible = false;
  }
}
