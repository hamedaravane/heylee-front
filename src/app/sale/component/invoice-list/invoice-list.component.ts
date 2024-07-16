import {Component, inject, OnInit} from "@angular/core";
import {SaleFacade} from "@sale/data-access/sale.facade";
import {NzCheckboxModule} from "ng-zorro-antd/checkbox";
import {AsyncPipe, DatePipe} from "@angular/common";
import {NzEmptyModule} from "ng-zorro-antd/empty";

@Component({
  selector: 'invoice-list',
  standalone: true,
  imports: [NzCheckboxModule, AsyncPipe, NzEmptyModule, DatePipe],
  templateUrl: './invoice-list.component.html',
})
export class InvoiceListComponent implements OnInit {
  private readonly saleFacade = inject(SaleFacade);
  invoiceData$ = this.saleFacade.invoice$;

  ngOnInit() {
    this.saleFacade.fetchInvoices().then();
  }
}
