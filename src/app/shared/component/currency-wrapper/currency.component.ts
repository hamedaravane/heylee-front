import {Component, Input} from '@angular/core';

@Component({
  standalone: true,
  selector: 'currency-wrapper',
  template: `<span class="mx-1 opacity-50 align-middle" style="font-size: 0.6rem">{{symbol}}</span>`
})
export class CurrencyComponent {
  @Input() symbol: string = 'ریال';
}
