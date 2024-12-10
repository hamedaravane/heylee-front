import { AfterViewInit, Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { GroupedStockItem } from '@inventory/entity/inventory.entity';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFabricObject, Canvas, FabricImage, FabricText, Rect, Textbox } from 'fabric';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { colors as COLOR } from '@colors';
import { distinctUntilChanged, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

function toPersianDigitWithSeparator(number: number): string {
  const formattedNumber = number.toLocaleString('en-US');
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return formattedNumber.replace(/\d/g, digit => persianDigits[parseInt(digit, 10)]).replace('.', ',');
}

const CONSTANTS = {
  canvasWidth: 1080,
  canvasHeight: 1920,
  titleTop: 200,
  productBgTop: 350,
  productBgWidth: 800,
  productBgHeight: 1100,
  productImageTop: 400,
  productImageWidth: 600,
  productImageHeight: 700,
  productNameTop: 1140,
  productColorsTop: 1230,
  productSizesTop: 1300,
  productCodeTop: 1380,
  priceTextTop: 1490,
  discountBgTop: 400,
  discountTextTop: 400,
  marketingTextTop: 1400
};

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
    <div class="absolute hidden -top-full -left-full">
      <canvas #storyCanvas></canvas>
    </div>
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
    this.generateCanvas();

    fromEvent(document.fonts as any, 'loadingdone')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.regenerateCanvas();
      });

    this.storyGeneratorForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), distinctUntilChanged())
      .subscribe(() => {
        this.regenerateCanvas();
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

    const title = new Textbox('HeyLee', {
      top: CONSTANTS.titleTop,
      left: canvas.width / 2,
      width: 600,
      textAlign: 'center',
      fontSize: 92,
      fontFamily: 'Candice',
      borderColor: COLOR.pink_1,
      fill: '#e11d48'
    });
    canvas.add(title);

    const productBg = new Rect({
      top: CONSTANTS.productBgTop,
      left: canvas.width / 2,
      width: CONSTANTS.productBgWidth,
      height: CONSTANTS.productBgHeight,
      fill: COLOR.rose_4,
      rx: 50,
      ry: 50
    });
    canvas.add(productBg);

    FabricImage.fromURL(image || '', { crossOrigin: 'anonymous' })
      .then(img => {
        const targetWidth = CONSTANTS.productImageWidth;
        const targetHeight = CONSTANTS.productImageHeight;

        const scaleFactor = Math.min(targetWidth / img.width, targetHeight / img.height);

        img.set({
          scaleX: scaleFactor,
          scaleY: scaleFactor,
          left: canvas.width / 2,
          top: CONSTANTS.productImageTop
        });
        console.log(img.getCrossOrigin());
        img.clipPath = new Rect({
          top: -img.height / 2,
          left: 0,
          width: img.width,
          height: img.height,
          rx: 45,
          ry: 45
        });
        const imageBorder = new Rect({
          scaleX: scaleFactor,
          scaleY: scaleFactor,
          width: img.width,
          height: img.height,
          top: CONSTANTS.productImageTop - 5,
          left: canvas.width / 2,
          fill: '#ffffff',
          stroke: 'white',
          strokeWidth: 10,
          rx: 45,
          ry: 45
        });
        canvas.add(imageBorder);
        canvas.add(img);
        canvas.renderAll();
      })
      .catch(err => console.error('Error loading product image', err));

    const productName = new Textbox(name, {
      top: CONSTANTS.productNameTop,
      left: canvas.width / 2,
      direction: 'rtl',
      originX: 'center',
      width: CONSTANTS.productImageWidth,
      textAlign: 'center',
      perPixelTargetFind: true,
      fontSize: 50,
      fontFamily: 'Vazirmatn',
      fontWeight: 700,
      fill: COLOR.pink_1
    });
    canvas.add(productName);

    const productColors = new Textbox(`رنگ‌ها: ${colors.map(color => color.label).join('، ')}`, {
      top: CONSTANTS.productColorsTop,
      left: canvas.width / 2,
      direction: 'rtl',
      originX: 'center',
      width: CONSTANTS.productImageWidth,
      textAlign: 'center',
      perPixelTargetFind: true,
      fontSize: 40,
      fontFamily: 'Vazirmatn',
      fontWeight: 700,
      fill: COLOR.pink_1
    });
    canvas.add(productColors);

    const productSizes = new Textbox(`سایزها: ${Array.from(this.allSizes).join('، ')}`, {
      top: CONSTANTS.productSizesTop,
      left: canvas.width / 2,
      direction: 'rtl',
      originX: 'center',
      width: CONSTANTS.productImageWidth,
      textAlign: 'center',
      perPixelTargetFind: true,
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

    const priceText = new FabricText(
      discountPercentage > 0
        ? `فقط ${toPersianDigitWithSeparator(this.discountedPrice)} تومان`
        : `${toPersianDigitWithSeparator(sellingUnitPrice / 10)} تومان`,
      {
        top: CONSTANTS.priceTextTop,
        left: canvas.width / 2,
        direction: 'rtl',
        originX: 'center',
        perPixelTargetFind: true,
        fontSize: 76,
        fontFamily: 'Vazirmatn',
        fill: '#4b5563',
        fontWeight: 700
      }
    );
    canvas.add(priceText);

    const marketingText = new FabricText(marketingDescription || '', {
      top: CONSTANTS.marketingTextTop,
      left: canvas.width / 2,
      direction: 'rtl',
      originX: 'center',
      perPixelTargetFind: true,
      fontSize: 50,
      fontFamily: 'Vazirmatn',
      fontStyle: 'italic',
      fill: '#6b7280'
    });
    canvas.add(marketingText);

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

    const blob = await new Promise<Blob | null>(resolve =>
      this.canvas?.toCanvasElement().toBlob(b => resolve(b), 'image/png')
    );

    if (!blob) {
      console.error('Failed to create Blob from canvas');
      return;
    }

    if (navigator.share) {
      const file = new File([blob], 'product-image.png', { type: 'image/png' });

      try {
        await navigator.share({
          files: [file]
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
