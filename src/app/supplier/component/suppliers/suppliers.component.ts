import {Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AsyncPipe, NgTemplateOutlet} from '@angular/common';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {RouterLink} from '@angular/router';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {SupplierFacade} from '../../data-access/supplier.facade';
import {CreateSupplierDto} from '../../entity/supplier.entity';
import {BidiModule} from '@angular/cdk/bidi';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzInputModule} from 'ng-zorro-antd/input';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PhoneFormatPipe} from '@shared/pipe/phone-format.pipe';

@Component({
  standalone: true,
  selector: 'suppliers',
  templateUrl: './suppliers.component.html',
    imports: [
        AsyncPipe,
        BidiModule,
        NzDrawerModule,
        NzFormModule,
        NzInputModule,
        NzDividerModule,
        NzSkeletonModule,
        NzEmptyModule,
        NzButtonModule,
        RouterLink,
        ReactiveFormsModule,
        PageContainerComponent,
        CardContainerComponent,
        NgTemplateOutlet,
        PhoneFormatPipe
    ]
})
export class SuppliersComponent implements OnInit {
  private readonly supplierFacade = inject(SupplierFacade);
  private readonly destroyRef = inject(DestroyRef);
  suppliersIndex$ = this.supplierFacade.suppliersIndex$;
  @ViewChild('supplier') supplierTempRef!: TemplateRef<void>;
  selectedSupplierId: number | null = null;
  createSupplierFormDrawer = false;
  editSupplierFormDrawer = false;
  loadingState = false;

  supplierForm = new FormGroup({
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    instagram: new FormControl('', [Validators.minLength(1), Validators.maxLength(30)]),
    telegram: new FormControl('', [Validators.minLength(5), Validators.maxLength(32)]),
  })

  ngOnInit() {
    this.loadSuppliers();
    this.supplierFacade.loading$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(loading => {
      this.loadingState = loading;
    })
  }

  loadSuppliers() {
    this.supplierFacade.loadSuppliers().then();
  }

  selectIdToEdit(id: number) {
    this.selectedSupplierId = id;
    this.editSupplierFormDrawer = true;
  }

  editSupplier() {
    const editedSupplier = this.supplierForm.getRawValue() as CreateSupplierDto;
    if (this.selectedSupplierId) {
      this.supplierFacade.editSupplier(this.selectedSupplierId, editedSupplier).then(() => {
        this.closeSupplierFormDrawer();
      });
    }
    this.supplierForm.reset();
  }

  createSupplier() {
    const newSupplier = this.supplierForm.getRawValue() as CreateSupplierDto;
    this.supplierFacade.createSupplier(newSupplier).then(() => {
      this.closeSupplierFormDrawer();
    });
    this.supplierForm.reset();
  }

  deleteSupplier(id: number) {
    this.supplierFacade.deleteSupplier(id).then(() => {
      this.closeSupplierFormDrawer();
    });
  }

  closeSupplierFormDrawer() {
    this.createSupplierFormDrawer = false;
    this.editSupplierFormDrawer = false;
  }
}
