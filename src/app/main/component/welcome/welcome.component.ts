import {Component, inject, OnInit} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {RouterLink} from '@angular/router';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {AuthApi} from '@auth/api/auth.api';

@Component({
  selector: 'welcome',
  standalone: true,
  imports: [NzButtonModule, NzGridModule, RouterLink, PageContainerComponent],
  templateUrl: './welcome.component.html'
})
export class WelcomeComponent implements OnInit {
  private readonly authApi = inject(AuthApi);
  private readonly activePages = this.authApi.activePages;

  buttons: { text: string; link: string, icon: string, disabled: boolean }[] = [
    {text: 'ثبت سفارش مشتری', link: 'sale', icon: 'fa-cart-shopping', disabled: true},
    {text: 'فاکتورهای فروش', link: 'invoices', icon: 'fa-receipt', disabled: true},
    {text: 'موجودی انبار', link: 'inventory', icon: 'fa-warehouse', disabled: true},
    {text: 'محصولات', link: 'product', icon: 'fa-gifts', disabled: true},
    {text: 'ثبت فاکتور خرید', link: 'purchase', icon: 'fa-wallet', disabled: true},
    {text: 'تامین کننده‌ها', link: 'supplier', icon: 'fa-handshake', disabled: true},
    {text: 'مشتریان', link: 'customer', icon: 'fa-person-booth', disabled: true},
    {text: 'تراکنش‌ها', link: 'transaction', icon: 'fa-wallet', disabled: true},
    {text: 'آمارها', link: 'statistic', icon: 'fa-chart-column', disabled: true},
    {text: 'فاکتورهای خرید', link: 'purchase-receipt', icon: 'fa-receipt', disabled: true}
  ];

  ngOnInit() {
    this.activePages.forEach(page => {
      this.buttons.forEach(button => {
        if (page === button.link) {
          button.disabled = false;
        }
      });
    });
  }

  logout() {
    this.authApi.logout();
  }
}
