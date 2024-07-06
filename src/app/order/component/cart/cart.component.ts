import {Component, inject} from '@angular/core';
import {OrderFacade} from "../../data-access/order.facade";
import {AsyncPipe, DecimalPipe, NgOptimizedImage} from "@angular/common";
import {of} from "rxjs";
import {Order} from "../../entity/order.entity";
import {NzGridModule} from "ng-zorro-antd/grid";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";

@Component({
  selector: 'cart',
  imports: [
    NzGridModule,
    AsyncPipe,
    NgOptimizedImage,
    DecimalPipe,
    NzDividerModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './cart.component.html',
  standalone: true
})
export class CartComponent {
  private readonly orderFacade = inject(OrderFacade);
  isCheckingOut$ = this.orderFacade.isCheckingOut$;
  isCheckingDiscountCode$ = this.orderFacade.isCheckingDiscountCode$;
  // cartOrders$ = this.orderFacade.cartOrders$;
  checkoutForm = new FormGroup({
    discountCode: new FormControl<string | null>(null)
  });
  discountCodeControl = this.checkoutForm.get('discountCode') as AbstractControl<string>;
  cartOrders$ = of([
    {
      name: 'سوتین توری پوش آپ',
      price: 3280000,
      colorCode: '#111',
      size: '85',
      code: 'ABC1234',
      imageSrc: 'https://i.pinimg.com/564x/99/17/b8/9917b82112807dc5762c21e89c5482ea.jpg',
      quantity: 1
    },
    {
      name: 'سوتین توری',
      price: 2100000,
      colorCode: '#111',
      size: '85',
      code: 'ABC1234',
      imageSrc: 'https://i.pinimg.com/564x/01/59/41/015941c60d0d6d09fd7beeced31684e6.jpg',
      quantity: 2
    },
  ] as Order[]);

  onCheckDiscountCode() {
    this.orderFacade.checkDiscountCode(this.discountCodeControl.value);
  }

  onCheckout() {
    this.orderFacade.checkout();
  }
}
