import {Component} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {RouterLink} from '@angular/router';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';

@Component({
  selector: 'welcome',
  standalone: true,
  imports: [NzButtonModule, NzGridModule, RouterLink, PageContainerComponent],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  buttons: {text: string; link: string, icon: string, disabled: boolean}[] = [
    {text: 'ثبت سفارش مشتری', link: 'sale', icon: 'fa-cart-shopping', disabled: true},
    {text: 'فاکتورهای فروش', link: 'invoices', icon: 'fa-receipt', disabled: true},
    {text: 'موجودی انبار', link: 'inventory', icon: 'fa-warehouse', disabled: true},
    {text: 'محصولات', link: 'product', icon: 'fa-gifts', disabled: true},
    {text: 'ثبت فاکتور خرید', link: 'purchase', icon: 'fa-wallet', disabled: true},
    {text: 'تامین کننده‌ها', link: 'supplier', icon: 'fa-handshake', disabled: false},
    {text: 'مشتریان', link: 'customer', icon: 'fa-person-booth', disabled: false},
  ];
}
