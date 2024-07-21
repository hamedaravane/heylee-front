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
  buttons: {text: string; link: string, icon: string}[] = [
    {text: 'ثبت سفارش مشتری', link: 'sale', icon: 'fa-cart-shopping'},
    {text: 'فاکتورهای فروش', link: 'invoices', icon: 'fa-receipt'},
    {text: 'موجودی انبار', link: 'inventory', icon: 'fa-warehouse'},
    {text: 'محصولات', link: 'product', icon: 'fa-gifts'},
    {text: 'ثبت فاکتور خرید', link: 'purchase', icon: 'fa-wallet'},
    {text: 'تامین کننده‌ها', link: 'supplier', icon: 'fa-handshake'},
    {text: 'مشتریان', link: 'customer', icon: 'fa-person-booth'},
  ];
}
