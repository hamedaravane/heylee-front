import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import { FormsModule } from '@angular/forms';
import { GroupedStockItem } from '@inventory/entity/inventory.entity';
import { colors } from '@colors';
import { CurrencyPipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { CurrencyComponent } from '@shared/component/currency-wrapper/currency.component';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  standalone: true,
  selector: 'create-story',
  templateUrl: './create-story.component.html',
  imports: [FormsModule, NzButtonModule, CurrencyPipe, NgIf, NgForOf, DecimalPipe, CurrencyComponent]
})
export class CreateStoryComponent implements OnInit {
  @ViewChild('storyElement') storyElement!: ElementRef<HTMLDivElement>;
  stockItem: GroupedStockItem = history.state.stockItem;
  discountPercentage = 0;
  marketingDescription = '';

  ngOnInit() {}

  get discountedPrice() {
    return ((this.stockItem.sellingUnitPrice / 10) * (1 - this.discountPercentage / 100)).toFixed(2);
  }

  downloadStory() {
    const storyElement = this.storyElement.nativeElement;
    if (storyElement) {
      if (this.stockItem.image) {
        html2canvas(storyElement, {
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
          imageTimeout: 6000,
          logging: true,
          scale: 5
        }).then(canvas => {
          const link = document.createElement('a');
          link.download = `${this.stockItem.code}_story.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        });
      }
    }
  }

  protected readonly colors = colors;
}
