import {Component, inject, OnInit} from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import {RouterLink, RouterOutlet} from '@angular/router';
import {AsyncPipe, NgOptimizedImage} from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import {OrderFacade} from "../../../order/data-access/order.facade";

@Component({
  selector: 'main',
  standalone: true,
  imports: [NzLayoutModule, RouterOutlet, NgOptimizedImage, NzGridModule, NzBadgeModule, RouterLink, AsyncPipe],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  private readonly orderFacade = inject(OrderFacade);
  cartOrders$ = this.orderFacade.cartOrders$;
}
