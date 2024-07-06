import {inject, Injectable} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Order} from "../entity/order.entity";
import {NzMessageService} from "ng-zorro-antd/message";

@Injectable({
  providedIn: 'root'
})
export class OrderFacade {
  private readonly _cartOrders = new Array<Order>();
  get cartOrders() {
    return this._cartOrders;
  }
  private readonly cartOrdersSubject = new BehaviorSubject<Order[]>([]);
  get cartOrders$(): Observable<Order[]> {
    return this.cartOrdersSubject.asObservable();
  }
  private readonly isCheckingOutSubject = new Subject<boolean>();
  get isCheckingOut$(): Observable<boolean> {
    return this.isCheckingOutSubject.asObservable();
  }
  private readonly isCheckingDiscountCodeSubject = new Subject<boolean>();
  get isCheckingDiscountCode$(): Observable<boolean> {
    return this.isCheckingDiscountCodeSubject.asObservable();
  }
  private readonly nzMessageService = inject(NzMessageService);

  setNewOrderToCart(order: Order) {
    try {
      this._cartOrders.push(order);
      this.cartOrdersSubject.next(this._cartOrders);
      this.nzMessageService.success('کالا با موفقیت به سبد خرید اضافه شد. برای تسویه به سفارشات مراجعه کنین.')
    } catch (e) {
      const error = e as Error;
      console.error(error);
      this.nzMessageService.error('در ثبت کالا خطایی رخ داده')
    }
  }

  checkDiscountCode(discountCode: string) {
  }

  checkout() {
  }
}
