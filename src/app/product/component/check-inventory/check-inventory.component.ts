import { Component } from '@angular/core';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'product-check-inventory',
  standalone: true,
  imports: [NzInputModule],
  templateUrl: './check-inventory.component.html',
})
export class CheckInventoryComponent {}