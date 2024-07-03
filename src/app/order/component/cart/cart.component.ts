import { Component } from '@angular/core';
import { NzListModule } from 'ng-zorro-antd/list';

@Component({
  selector: 'cart',
  imports: [NzListModule],
  templateUrl: './cart.component.html',
  standalone: true
})
export class CartComponent {
}