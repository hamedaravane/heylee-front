import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GroupedStockItem } from '@inventory/entity/inventory.entity';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFabricObject, Canvas, FabricImage, FabricText, Rect } from 'fabric';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSliderModule } from 'ng-zorro-antd/slider';

@Component({
  standalone: true,
  template: ` <form nz-form [formGroup]="storyGeneratorForm">
      <nz-form-item>
        <nz-form-label>نرخ تخفیف</nz-form-label>
        <nz-form-control>
          <nz-slider nzMin="0" nzMax="100" nzStep="1" formControlName="discountPercentage"></nz-slider>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label>توضیحات</nz-form-label>
        <nz-form-control>
          <textarea formControlName="marketingDescription" nz-input maxlength="50"></textarea>
        </nz-form-control>
      </nz-form-item>
    </form>
    <canvas class="scale-50" #storyCanvas></canvas>
    <div class="text-center mt-4">
      <button (click)="downloadStory()" nz-button nzType="default" type="button" class="me-4">
        <span>دانلود</span>
        <i class="fa-solid fa-download ms-2"></i>
      </button>
      <button (click)="shareStory()" nz-button nzType="primary" type="button">
        <span>اشتراک گذاری</span>
        <i class="fa-solid fa-share ms-2"></i>
      </button>
    </div>`,
  imports: [NzButtonModule, NzFormModule, NzInputModule, NzSliderModule, ReactiveFormsModule],
  selector: 'story-generator'
})
export class StoryGeneratorComponent implements AfterViewInit {
  @ViewChild('storyCanvas', { static: true }) storyCanvas!: ElementRef<HTMLCanvasElement>;
  stockItem: GroupedStockItem = history.state.stockItem;
  storyGeneratorForm = new FormGroup({
    discountPercentage: new FormControl<number>(10, { nonNullable: true }),
    marketingDescription: new FormControl<string>('', Validators.maxLength(50))
  });
  allSizes = new Set(this.stockItem.colors.flatMap(c => c.sizes.map(s => s.label)));

  ngAfterViewInit() {
    const font = new FontFace('Candice', 'url(/media/Candice-Regular.woff2)');
    font
      .load()
      .then(f => {
        f.loaded.then(() => {
          this.generateCanvas();
        });
      })
      .catch(e => {
        console.error(e);
      });
  }

  get discountedPrice() {
    const discount = this.storyGeneratorForm.controls.discountPercentage.value;
    return (this.stockItem.sellingUnitPrice / 10) * (1 - discount / 100);
  }

  private generateCanvas(): void {
    const canvas = new Canvas(this.storyCanvas.nativeElement, {
      width: 1080,
      height: 1920,
      backgroundColor: '#ffffff'
    });

    const { name, image, sellingUnitPrice, code, colors } = this.stockItem;
    const discountPercentage = this.storyGeneratorForm.controls.discountPercentage.value;
    const marketingDescription = this.storyGeneratorForm.controls.marketingDescription.value;

    BaseFabricObject.ownDefaults.originX = 'center';

    // Add background pattern as an image
    FabricImage.fromURL('/images/bg-pattern.jpg')
      .then(img => {
        img.scaleToWidth(canvas.width);
        img.scaleToHeight(canvas.height);
        canvas.backgroundImage = img;
        canvas.renderAll();
      })
      .catch(err => console.error('Error loading background image', err));

    // Add title
    const title = new FabricText('HeyLee', {
      top: 250,
      left: canvas.width / 2,
      fontSize: 80,
      fontFamily: 'Candice',
      fill: '#e11d48'
    });
    canvas.add(title);

    // Add product container
    const productBg = new Rect({
      top: 450,
      left: canvas.width / 2,
      width: 500,
      height: 800,
      fill: 'linear-gradient(to bottom left, #cbd5e1, #93c5fd)',
      rx: 30,
      ry: 30
    });
    canvas.add(productBg);

    // Add product image
    FabricImage.fromURL(image || '')
      .then(img => {
        img.scaleToWidth(500);
        img.scaleToHeight(500);
        img.set({
          top: 300,
          left: canvas.width / 2,
          clipPath: new Rect({ width: 500, height: 500 })
        });
        canvas.add(img);
        canvas.renderAll();
      })
      .catch(err => console.error('Error loading product image', err));

    // Add product details
    const productName = new FabricText(name, {
      top: 800,
      left: canvas.width / 2,
      fontSize: 50,
      fontFamily: 'Vazirmatn',
      fill: '#374151'
    });
    canvas.add(productName);

    const productColors = new FabricText(`رنگ‌ها: ${colors.map(color => color.label).join('، ')}`, {
      top: 880,
      left: canvas.width / 2,
      fontSize: 40,
      fontFamily: 'Vazirmatn',
      fill: '#0891b2'
    });
    canvas.add(productColors);

    const productSizes = new FabricText(`سایزها: ${Array.from(this.allSizes).join('، ')}`, {
      top: 940,
      left: canvas.width / 2,
      fontSize: 40,
      fontFamily: 'Vazirmatn',
      fill: '#0891b2'
    });
    canvas.add(productSizes);

    const productCode = new FabricText(code, {
      top: 1000,
      left: canvas.width / 2,
      fontSize: 30,
      fontFamily: 'monospace',
      fill: '#4b5563'
    });
    canvas.add(productCode);

    // Add price or discounted price
    const priceText = new FabricText(
      discountPercentage > 0 ? `فقط ${this.discountedPrice} تومان` : `${sellingUnitPrice / 10} تومان`,
      {
        top: 1100,
        left: canvas.width / 2,
        fontSize: 60,
        fontFamily: 'Vazirmatn',
        fill: '#4b5563',
        fontWeight: 'bold'
      }
    );
    canvas.add(priceText);

    // Add discount badge (if applicable)
    if (discountPercentage > 0) {
      const discountBg = new Rect({
        top: 300,
        left: 800,
        width: 160,
        height: 40,
        fill: '#e11d48',
        angle: -45,
        rx: 10,
        ry: 10
      });
      canvas.add(discountBg);

      const discountText = new FabricText(`${discountPercentage}% OFF`, {
        top: 285,
        left: 810,
        fontSize: 30,
        fontFamily: 'Vazirmatn',
        fill: '#ffffff',
        angle: -45
      });
      canvas.add(discountText);
    }

    const marketingText = new FabricText(marketingDescription || '', {
      top: 1300,
      left: canvas.width / 2,
      fontSize: 50,
      fontFamily: 'Vazirmatn',
      fontStyle: 'italic',
      fill: '#6b7280'
    });
    canvas.add(marketingText);

    canvas.renderAll();
  }

  downloadStory() {}

  shareStory() {}
}
