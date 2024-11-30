import { Customer, CustomerDto } from '@customer/entity/customer.entity';
import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { debounceTime, distinctUntilChanged, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterIndex } from '@shared/entity/common.entity';
import { CustomerFacade } from '@customer/data-access/customer.facade';

type CustomerForm = Omit<Customer, 'id' | 'cashbackBalance' | 'createdAt'>

@Component({
  standalone: true,
  selector: 'customer-form',
  template: `
    <form nz-form nzLabelAlign="right" nzLayout="vertical" [formGroup]="customerForm" (ngSubmit)="onSubmit()">
      <nz-alert class="mb-4" nzType="info" nzMessage="قبل از ثبت این فاکتور، مشتری باید ثبت شده باشه!" nzShowIcon />
      <!-- customer phone -->
      <nz-form-item>
        <nz-form-label [nzRequired]="true" nzFor="phone"
        >شماره تماس
        </nz-form-label>
        <nz-form-control dir="ltr">
          <nz-select
            formControlName="phone"
            required
            type="tel"
            inputmode="numeric"
            id="phone"
            nzServerSearch
            (nzOnSearch)="onPhoneSearch($event)"
            nzPlaceHolder="بدون صفر"
            nzShowSearch
          >
            @for (customer of customers; track customer.id) {
              <nz-option [nzValue]="customer.phone" [nzLabel]="customer.phone"></nz-option>
            }
          </nz-select>
        </nz-form-control>
      </nz-form-item>
      <!-- customer full name -->
      <nz-form-item>
        <nz-form-label [nzRequired]="true" nzFor="name"
        >نام کامل مشتری
        </nz-form-label>
        <nz-form-control>
          <input nz-input required name="name" type="text" id="name" formControlName="name" />
        </nz-form-control>
      </nz-form-item>
      <!-- customer city -->
      <nz-form-item>
        <nz-form-label
          [nzRequired]="true"
          nzFor="cityCustomer"
        >شهر
        </nz-form-label>
        <nz-form-control>
          <input nz-input required name="cityCustomer" type="text" id="cityCustomer"
                 formControlName="city" />
        </nz-form-control>
      </nz-form-item>
      <!-- customer address -->
      <nz-form-item>
        <nz-form-label
          [nzRequired]="true"
          nzFor="addressCustomer"
        >آدرس
        </nz-form-label>
        <nz-form-control>
        <textarea
          nz-input
          required
          name="addressCustomer"
          id="addressCustomer"
          formControlName="address"
          [nzAutosize]="{ minRows: 2, maxRows: 4 }"
        ></textarea>
        </nz-form-control>
      </nz-form-item>
      <!-- postal code -->
      <nz-form-item>
        <nz-form-label
          [nzRequired]="true"
          nzFor="postalCode"
        >کد پستی
        </nz-form-label>
        <nz-form-control>
          <input
            nz-input
            required
            name="postalCode"
            type="text"
            inputmode="numeric"
            id="postalCode"
            formControlName="postalCode"
          />
        </nz-form-control>
      </nz-form-item>
      <!-- instagram -->
      <nz-form-item>
        <nz-form-label [nzRequired]="true"
                       nzFor="instagram">
          <span>اینستاگرام</span>
          <i class="fa-brands fa-instagram mx-2"></i>
        </nz-form-label>
        <nz-form-control dir="ltr">
          <nz-input-group nzAddOnBefore="instagram.com/" nzAddOnAfter="/">
            <input
              nz-input
              name="instagram"
              type="text"
              id="instagram"
              minlength="1"
              maxlength="30"
              formControlName="instagram"
            />
          </nz-input-group>
        </nz-form-control>
      </nz-form-item>
      <!-- telegram -->
      <nz-form-item>
        <nz-form-label [nzRequired]="true" nzFor="telegram">
          <span>تلگرام</span>
          <i class="fa-brands fa-telegram mx-2"></i>
        </nz-form-label>
        <nz-form-control dir="ltr">
          <nz-input-group nzAddOnBefore="t.me/" nzAddOnAfter="/">
            <input
              nz-input
              name="telegram"
              type="text"
              id="telegram"
              minlength="5"
              maxlength="32"
              formControlName="telegram"
            />
          </nz-input-group>
        </nz-form-control>
      </nz-form-item>
    </form>`,
  imports: [NzFormModule, NzAlertModule, NzInputModule, NzSelectModule, ReactiveFormsModule]
})
export class CustomerFormComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly customerFacade = inject(CustomerFacade);
  @Input() customers: Customer[] = [];
  @Output() customerChange = new EventEmitter<CustomerForm>();
  @Output() formValidityChange = new EventEmitter<boolean>();

  customerForm: FormGroup = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    phone: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    postalCode: new FormControl<string>(''),
    telegram: new FormControl<string>('', {
      validators: [Validators.minLength(5), Validators.maxLength(32)]
    }),
    instagram: new FormControl<string>('', {
      validators: [Validators.minLength(1), Validators.maxLength(30)]
    }),
    city: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
    address: new FormControl<string>('', { nonNullable: true, validators: Validators.required })
  });

  ngOnInit() {
    this.customerForm.valueChanges.subscribe(() => {
      this.formValidityChange.emit(this.customerForm.valid);
    });
  }

  onSubmit() {
    if (this.customerForm.valid) {
      this.customerChange.emit(this.customerForm.getRawValue());
    }
  }

  onPhoneSearch($event: string) {
    of($event)
      .pipe(debounceTime(2000), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const filter: FilterIndex<CustomerDto>[] = [{ prop: 'phone', operator: 'like', value: $event }];
        this.customerFacade.loadCustomers(1, filter).then();
      });
  }
}
