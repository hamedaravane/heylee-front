import {Component, DestroyRef, forwardRef, inject, Input} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'currency-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputComponent),
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
          class="font-mono"
          [formControl]="controlValue"
          (input)="onInput($event)"
          (blur)="onBlur()"
      />
    </nz-input-group>`
})
export class CurrencyInputComponent implements ControlValueAccessor {
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
    let value = input.value.replace(/[^\d]/g, ''); // Remove non-digit characters
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