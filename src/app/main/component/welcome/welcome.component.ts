import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterLink } from '@angular/router';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { PageContainerComponent } from '@shared/component/page-container/page-container.component';

@Component({
  selector: 'welcome',
  standalone: true,
  imports: [NzButtonModule, NzGridModule, RouterLink, PageContainerComponent],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  buttons: {text: string; link: string}[] = [
    {text: 'ثبت فاکتور فروش', link: 'sale'},
    {text: 'موجودی انبار', link: 'inventory'},
    {text: 'ثبت فاکتور خرید', link: 'purchase'},
    {text: 'فاکتورهای فروش', link: 'invoices'},
    {text: 'تامین کننده‌ها', link: 'supplier'},
    {text: 'مشتریان', link: 'customer'},
    {text: 'محصولات', link: 'product'},
  ];
}
