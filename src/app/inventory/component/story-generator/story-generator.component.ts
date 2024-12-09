import { AfterViewInit, Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { GroupedStockItem } from '@inventory/entity/inventory.entity';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFabricObject, Canvas, FabricImage, FabricText, Gradient, Rect } from 'fabric';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { colors as COLOR } from '@colors';
import { distinctUntilChanged, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

function toPersianDigitWithSeparator(number: number): string {
  const formattedNumber = number.toLocaleString('en-US');
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return formattedNumber
    .replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)])
    .replace('.', ',');
}

const CONSTANTS = {
  canvasWidth: 1080,
  canvasHeight: 1920,
  titleTop: 200,
  productBgTop: 350,
  productBgWidth: 700,
  productBgHeight: 1100,
  productImageTop: 400,
  productNameTop: 1140,
  productColorsTop: 1240,
  productSizesTop: 1300,
  productCodeTop: 1380,
  priceTextTop: 1490,
  discountBgTop: 400,
  discountTextTop: 400,
  marketingTextTop: 1400
}

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
    <canvas #storyCanvas></canvas>
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
  @ViewChild('storyCanvas', { static: false }) storyCanvas!: ElementRef<HTMLCanvasElement>;
  private readonly destroyRef = inject(DestroyRef);
  canvas: Canvas | null = null;
  stockItem: GroupedStockItem = history.state.stockItem;
  storyGeneratorForm = new FormGroup({
    discountPercentage: new FormControl<number>(0, { nonNullable: true }),
    marketingDescription: new FormControl<string>('', Validators.maxLength(50))
  });
  allSizes = new Set(this.stockItem.colors.flatMap(c => c.sizes.map(s => s.label)));

  ngAfterViewInit() {
    const candiceFont = new FontFace('Candice', 'url(/media/Candice-Regular.woff2)');

    candiceFont
      .load()
      .then(loadedFont => {
        (document.fonts as any).add(loadedFont);
        this.generateCanvas();
      })
      .catch(err => console.error('Failed to load Candice font:', err));

    // Listen to form changes and regenerate the canvas
    this.storyGeneratorForm.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged(),
      )
      .subscribe(() => {
        this.regenerateCanvas(); // Clear the canvas
      });
  }

  private regenerateCanvas() {
    this.canvas?.clear();
    this.generateCanvas();
  }

  get discountedPrice() {
    const discount = this.storyGeneratorForm.controls.discountPercentage.value;
    return (this.stockItem.sellingUnitPrice / 10) * (1 - discount / 100);
  }

  private generateCanvas(): void {
    this.canvas?.dispose();

    const canvas = new Canvas(this.storyCanvas.nativeElement, {
      width: CONSTANTS.canvasWidth,
      height: CONSTANTS.canvasHeight,
      backgroundColor: '#ffffff'
    });

    const { name, image, sellingUnitPrice, code, colors } = this.stockItem;
    const discountPercentage = this.storyGeneratorForm.controls.discountPercentage.value;
    const marketingDescription = this.storyGeneratorForm.controls.marketingDescription.value;

    BaseFabricObject.ownDefaults.originX = 'center';

    FabricImage.fromURL('/images/bg-pattern.png')
      .then(img => {
        img.set({
          width: canvas.width,
          height: canvas.height,
          top: 0,
          left: canvas.width / 2
        });
        canvas.backgroundImage = img;
        canvas.renderAll();
      })
      .catch(err => console.error('Error loading background image', err));

    // Add title
    const title = new FabricText('HeyLee', {
      top: CONSTANTS.titleTop,
      left: canvas.width / 2,
      fontSize: 80,
      fontFamily: 'Candice',
      fill: '#e11d48'
    });
    canvas.add(title);

    // Add product container
    const productBg = new Rect({
      top: CONSTANTS.productBgTop,
      left: canvas.width / 2,
      width: CONSTANTS.productBgWidth,
      height: CONSTANTS.productBgHeight,
      fill: new Gradient<'linear'>({
        coords: {
          x1: 0,
          y1: 0,
          x2: canvas.width,
          y2: canvas.height
        },
        colorStops: [
          { offset: 0, color: COLOR.rose_3 },
          { offset: 0.6, color: COLOR.rose_4 }
        ]
      }),
      rx: 30,
      ry: 30
    });
    canvas.add(productBg);

    const imageBorder = new Rect({
      height: 704,
      width: 604,
      top: CONSTANTS.productImageTop - 2,
      left: canvas.width / 2,
      fill: '#ffffff',
      rx: 30,
      ry: 30
    })
    canvas.add(imageBorder);

    // Add product image
    FabricImage.fromURL(image || '', {crossOrigin: 'anonymous'})
      .then(img => {
        img.set({
          height: 700,
          top: CONSTANTS.productImageTop,
          left: canvas.width / 2,
        });
        console.log(img.getCrossOrigin());
        img.clipPath = new Rect({
          top: -img.height / 2,
          left: 0,
          width: img.width,
          height: img.height,
          rx: 30,
          ry: 30
        });
        canvas.add(img);
      })
      .catch(err => console.error('Error loading product image', err));

    // Add product details
    const productName = new FabricText(name, {
      top: CONSTANTS.productNameTop,
      left: canvas.width / 2,
      fontSize: 50,
      fontFamily: 'Vazirmatn',
      fontWeight: 700,
      fill: COLOR.pink_1
    });
    canvas.add(productName);

    const productColors = new FabricText(`رنگ‌ها: ${colors.map(color => color.label).join('، ')}`, {
      top: CONSTANTS.productColorsTop,
      left: canvas.width / 2,
      fontSize: 40,
      fontFamily: 'Vazirmatn',
      fontWeight: 700,
      fill: COLOR.pink_1
    });
    canvas.add(productColors);

    const productSizes = new FabricText(`سایزها: ${Array.from(this.allSizes).join('، ')}`, {
      top: CONSTANTS.productSizesTop,
      left: canvas.width / 2,
      fontSize: 40,
      fontFamily: 'Vazirmatn',
      fontWeight: 700,
      fill: COLOR.pink_1
    });
    canvas.add(productSizes);

    const productCode = new FabricText(code, {
      top: CONSTANTS.productCodeTop,
      left: canvas.width / 2,
      fontSize: 30,
      fontFamily: 'monospace',
      fill: COLOR.pink_1
    });
    canvas.add(productCode);

    // Add price or discounted price
    const priceText = new FabricText(
      discountPercentage > 0 ? `فقط ${toPersianDigitWithSeparator(this.discountedPrice)}` : `${toPersianDigitWithSeparator(sellingUnitPrice / 10)}`,
      {
        top: CONSTANTS.priceTextTop,
        left: canvas.width / 2,
        fontSize: 72,
        fontFamily: 'Vazirmatn',
        fill: '#4b5563',
        fontWeight: 700
      }
    );
    canvas.add(priceText);

    const marketingText = new FabricText(marketingDescription || '', {
      top: CONSTANTS.marketingTextTop,
      left: canvas.width / 2,
      fontSize: 50,
      fontFamily: 'Vazirmatn',
      fontStyle: 'italic',
      fill: '#6b7280'
    });
    canvas.add(marketingText);

    // Add discount badge (if applicable)
    if (discountPercentage > 0) {
      const discountBg = new Rect({
        top: CONSTANTS.discountBgTop,
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
        top: CONSTANTS.discountTextTop,
        left: 810,
        fontSize: 30,
        fontWeight: 'bold',
        fontFamily: 'Vazirmatn',
        fill: '#ffffff',
        angle: -45
      });
      canvas.add(discountText);

      canvas.bringObjectToFront(discountBg);
      canvas.bringObjectToFront(discountText);
    }

    this.canvas = canvas;
    this.canvas.renderAll();
  }

  downloadStory() {
    if (!this.canvas) return;

    const dataURL = this.storyCanvas.nativeElement.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'product-image.png';
    link.click();
  }

  async shareStory() {
    if (!this.canvas) return;

    const blob = await new Promise<Blob | null>((resolve) =>
      this.canvas?.toCanvasElement().toBlob((b) => resolve(b), 'image/png')
    );

    if (!blob) {
      console.error('Failed to create Blob from canvas');
      return;
    }

    // Check if Web Share API is supported
    if (navigator.share) {
      const file = new File([blob], 'product-image.png', { type: 'image/png' });

      try {
        await navigator.share({
          files: [file],
        });
        console.log('Canvas image shared successfully');
      } catch (error) {
        console.error('Error sharing canvas image:', error);
      }
    } else {
      console.error('Web Share API not supported in this browser');
    }
  }
}
