import {Component, DestroyRef, forwardRef, inject, Input} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule} from "@angular/forms";
import {NzInputModule} from "ng-zorro-antd/input";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'ngx-price-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxPriceInputComponent),
      multi: true
    }
  ],
  imports: [
    NzInputModule,
    ReactiveFormsModule
  ],
  template: `
    <nz-input-group [nzSize]="size" [nzAddOnBefore]="currency">
      <input
          nz-input
          type="text"
          inputmode="numeric"
          style="'font-family': ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"
          [formControl]="controlValue"
          (input)="onInput($event)"
          (blur)="onBlur()"
      />
    </nz-input-group>`
})
export class NgxPriceInputComponent implements ControlValueAccessor {
  private readonly destroyRef = inject(DestroyRef);
  @Input() currency: string = 'ریال';
  @Input() size: 'large' | 'default' | 'small' = 'default';
  controlValue = new FormControl<string>('');
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.controlValue.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        const numericValue = this.parseValue(value);
        this.onChange(numericValue);
      });
  }

  private formatValue(value: number): string {
    return value.toLocaleString('en-US');
  }

  private parseValue(value: string | null): number | null {
    if (value === null || value === '') return null;
    return parseInt(value.replace(/,/g, ''), 10);
  }

  onBlur(): void {
    this.onTouched();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^\d]/g, '');
    if (value) {
      const numericValue = parseInt(value, 10);
      input.value = this.formatValue(numericValue);
    } else {
      input.value = '';
    }
    this.controlValue.setValue(input.value, {emitEvent: true});
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.controlValue.disable();
    } else {
      this.controlValue.enable();
    }
  }

  writeValue(value: number | null): void {
    if (value !== null) {
      this.controlValue.setValue(this.formatValue(value), {emitEvent: false});
    } else {
      this.controlValue.setValue('', {emitEvent: false});
    }
  }
}
