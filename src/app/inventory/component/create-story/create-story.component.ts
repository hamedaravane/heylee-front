import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupedStockItem } from '@inventory/entity/inventory.entity';
import { CurrencyPipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { CurrencyComponent } from '@shared/component/currency-wrapper/currency.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  standalone: true,
  selector: 'create-story',
  templateUrl: './create-story.component.html',
  imports: [
    FormsModule,
    NzButtonModule,
    NzInputNumberModule,
    NzInputModule,
    NzSliderModule,
    NzFormModule,
    CurrencyPipe,
    NgIf,
    NgForOf,
    DecimalPipe,
    CurrencyComponent,
    ReactiveFormsModule
  ]
})
export class CreateStoryComponent implements OnInit {
  @ViewChild('storyElement') storyElement!: ElementRef<HTMLDivElement>;
  private message = inject(NzMessageService);
  stockItem: GroupedStockItem = history.state.stockItem;

  storyGeneratorForm = new FormGroup({
    discountPercentage: new FormControl<number>(10, { nonNullable: true }),
    marketingDescription: new FormControl<string>('', Validators.maxLength(50))
  });
  allSizes = new Set(this.stockItem.colors.flatMap(c => c.sizes.map(s => s.label)));

  ngOnInit() {}

  get discountedPrice() {
    return (
      (this.stockItem.sellingUnitPrice / 10) *
      (1 - this.storyGeneratorForm.controls.discountPercentage.value / 100)
    ).toFixed(2);
  }

  private elementToCanvas(element: HTMLElement) {
    return html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      imageTimeout: 3000,
      logging: true,
      windowHeight: element.offsetHeight,
      windowWidth: element.offsetWidth,
      scale: 4
    });
  }

  downloadStory() {
    const storyElement = this.storyElement.nativeElement;
    if (storyElement) {
      this.elementToCanvas(storyElement).then(canvas => {
        const link = document.createElement('a');
        link.download = `${this.stockItem.code}_story.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  }

  shareStory() {
    const storyElement = this.storyElement.nativeElement;
    if (storyElement) {
      this.elementToCanvas(storyElement).then(async canvas => {
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));
        if (!blob) {
          this.message.error('خطا در ایجاد تصویر رسید.');
          return;
        }
        const file = new File([blob], 'receipt.png', { type: 'image/png' });
        const shareData: ShareData = {
          files: [file]
        };
        await navigator.share(shareData);
        this.message.success('با موفقیت به اشتراک گذاشته شد.');
      });
    }
  }
}
