import { Component, DestroyRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { BidiModule } from '@angular/cdk/bidi';
import { CustomerFacade } from '@customer/data-access/customer.facade';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { Customer } from '@customer/entity/customer.entity';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'customer-form',
  template: `
    <form nz-form nzLabelAlign="right" nzLayout="vertical" [formGroup]="customerForm">
      <!-- customer phone -->
      <nz-form-item>
        <nz-form-label nzRequired nzFor="phone">شماره تماس</nz-form-label>
        <nz-form-control dir="ltr">
          <input
            nz-input
            formControlName="phone"
            required
            type="tel"
            inputmode="numeric"
            id="phone"
            [nzAutocomplete]="auto"
            placeholder="بدون صفر"
          />
          <nz-autocomplete #auto>
            @if (customers$ | async; as customers) {
              @for (customer of customers; track customer.id) {
                <nz-auto-option dir="ltr" [nzValue]="customer.phone" [nzLabel]="customer.phone">
                  {{ customer.phone }}
                </nz-auto-option>
              }
            }
          </nz-autocomplete>
        </nz-form-control>
      </nz-form-item>
      <!-- customer full name -->
      <nz-form-item>
        <nz-form-label nzRequired nzFor="name">نام کامل مشتری</nz-form-label>
        <nz-form-control>
          <input nz-input required name="name" type="text" id="name" formControlName="name" />
        </nz-form-control>
      </nz-form-item>
      <!-- customer city -->
      <nz-form-item>
        <nz-form-label nzRequired nzFor="cityCustomer">شهر</nz-form-label>
        <nz-form-control>
          <input nz-input required name="cityCustomer" type="text" id="cityCustomer" formControlName="city" />
        </nz-form-control>
      </nz-form-item>
      <!-- customer address -->
      <nz-form-item>
        <nz-form-label nzRequired nzFor="addressCustomer">آدرس</nz-form-label>
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
        <nz-form-label nzFor="postalCode">کد پستی</nz-form-label>
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
        <nz-form-label nzFor="instagram">
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
        <nz-form-label nzFor="telegram">
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
    </form>
  `,
  imports: [
    NzFormModule,
    NzAutocompleteModule,
    NzAlertModule,
    NzInputModule,
    ReactiveFormsModule,
    AsyncPipe,
    BidiModule
  ]
})
export class CustomerFormComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly customerFacade = inject(CustomerFacade);
  readonly customers$ = this.customerFacade.customersIndex$.pipe(map(value => value.items));
  @Input() selective: boolean = false;
  @Input() selectedCustomer: Customer | null = null;
  @Output() formValue = new EventEmitter<Customer>();
  @Output() formValidity = new EventEmitter<boolean>();

  customerForm = new FormGroup({
    id: new FormControl<number>({ value: NaN, disabled: true }, { nonNullable: true }),
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: Validators.required
    }),
    phone: new FormControl<string>('', {
      nonNullable: true,
      validators: Validators.required
    }),
    postalCode: new FormControl<string>(''),
    telegram: new FormControl<string>('', {
      validators: [Validators.minLength(5), Validators.maxLength(32)]
    }),
    instagram: new FormControl<string>('', {
      validators: [Validators.minLength(1), Validators.maxLength(30)]
    }),
    city: new FormControl<string>('', {
      nonNullable: true,
      validators: Validators.required
    }),
    address: new FormControl<string>('', {
      nonNullable: true,
      validators: Validators.required
    }),
    cashbackBalance: new FormControl<number>({ value: 0, disabled: true }, { nonNullable: true }),
    createdAt: new FormControl<string>({
      value: new Date().toISOString() || '',
      disabled: true
    })
  });

  ngOnInit() {
    Object.entries(this.customerForm.controls)
      .filter(([key]) => key !== 'phone')
      .forEach(([_, control]) => {
        if (this.selective) {
          control.disable({ emitEvent: false });
        }
      });
    if (this.selectedCustomer) {
      this.customerForm.patchValue(this.selectedCustomer);
      this.formValidity.emit(this.customerForm.valid);
      this.formValue.emit(this.customerForm.getRawValue());
    }
    this.customerForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.formValue.emit(this.customerForm.getRawValue());
    });
    this.customerForm.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.formValidity.emit(this.customerForm.valid);
    });
    this.customerForm.controls.phone.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.formValidity.emit(this.customerForm.valid);
          this.formValue.emit(this.customerForm.getRawValue());
        }),
        debounceTime(1000),
        distinctUntilChanged(),
        tap(value => this.onPhoneSearch(value)),
        switchMap((phoneValue: string) =>
          this.customers$.pipe(map(customers => customers.find(c => c.phone === phoneValue)))
        )
      )
      .subscribe(customer => {
        if (!customer) return;
        this.customerForm.patchValue(
          {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            postalCode: customer.postalCode,
            telegram: customer.telegram,
            instagram: customer.instagram,
            city: customer.city,
            address: customer.address,
            cashbackBalance: customer.cashbackBalance,
            createdAt: customer.createdAt
          },
          { emitEvent: false }
        );
        this.formValue.emit(this.customerForm.getRawValue());
      });
  }

  onPhoneSearch(phoneValue: string) {
    this.customerFacade.loadCustomers(1, [{ prop: 'phone', operator: 'like', value: phoneValue }]);
  }

  ngOnDestroy() {
    this.customerForm.reset();
  }
}
