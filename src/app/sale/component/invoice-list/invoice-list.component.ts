import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {SaleFacade} from '@sale/data-access/sale.facade';
import {AsyncPipe, CurrencyPipe, DecimalPipe, NgIf, NgTemplateOutlet} from '@angular/common';
import {NzEmptyModule} from 'ng-zorro-antd/empty';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';
import {FormsModule} from '@angular/forms';
import {NzPaginationModule} from 'ng-zorro-antd/pagination';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {CardContainerComponent} from '@shared/component/card-container/card-container.component';
import {PersianDatePipe} from '@sale/pipe/persian-date.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SaleInvoice} from '@sale/entity/invoice.entity';
import {CurrencyComponent} from '@shared/component/currency-wrapper/currency.component';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {InventoryApi} from '@inventory/api/inventory.api';
import {Router, RouterLink} from '@angular/router';
import * as htmlToImage from 'html-to-image';

@Component({
  selector: 'invoice-list',
  standalone: true,
  imports: [NzModalModule, NzButtonModule, NzPaginationModule, AsyncPipe, NzEmptyModule, CurrencyPipe, NzSkeletonModule, DecimalPipe, FormsModule, PageContainerComponent, CardContainerComponent, PersianDatePipe, CurrencyComponent, NgIf, RouterLink, NgTemplateOutlet],
  templateUrl: './invoice-list.component.html'
})
export class InvoiceListComponent implements OnInit {
  private readonly saleFacade = inject(SaleFacade);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly inventoryApi = inject(InventoryApi);
  invoiceData: SaleInvoice[] = [];
  loadingState = false;
  loadingButtons = false;
  selectedInvoice = signal<SaleInvoice | null>(null);

  ngOnInit() {
    this.saleFacade.loadInvoices().then();
    this.saleFacade.invoices$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(invoices => {
        this.invoiceData = invoices;
      });
    this.saleFacade.loading$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(loading => {
        this.loadingState = loading;
      });
  }

  async generateReceipt(invoice: SaleInvoice) {
    this.selectedInvoice.set(invoice);
    try {
      this.loadingButtons = true;
      await new Promise(resolve => setTimeout(resolve, 100));
      if (window.innerWidth > 768) {
        const dataUrl = await htmlToImage.toPng(document.getElementById('receipt') as HTMLElement, { quality: 1, style: { visibility: 'visible' } });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `sale-receipt-${invoice.customer.phone}.png`;
        link.click();
      } else {
        const blob = await htmlToImage.toBlob(document.getElementById('receipt') as HTMLElement);
        if (!blob) {
          console.error('blob is null');
          return;
        }
        const file = new File([blob], 'receipt.png', {type: 'image/png'});
        await navigator.share({
          files: [file],
          title: `شماره فاکتور`,
          text: `شماره فاکتور: ${invoice.number}`
        });
      }
    } catch (e) {
      console.error('error', e);
    } finally {
      this.selectedInvoice.set(null);
      this.loadingButtons = false;
    }
  }

  navigateToEdit(invoice: SaleInvoice) {
    this.router.navigate(['/sale'], {state: {invoice: invoice}});
  }
}
