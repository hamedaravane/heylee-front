import { AfterViewInit, Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { GroupedStockItem } from '@inventory/entity/inventory.entity';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseFabricObject, Canvas, FabricImage, FabricText, Rect, Textbox } from 'fabric';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { distinctUntilChanged, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';

function toPersianDigitWithSeparator(number: number): string {
  const formattedNumber = number.toLocaleString('en-US');
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return formattedNumber.replace(/\d/g, digit => persianDigits[parseInt(digit, 10)]).replace('.', ',');
}

const CONSTANTS = {
  canvasBgColor: '#f4f2ee',
  canvasWidth: 1080,
  canvasHeight: 1920,
  titleTop: 187,
  productBgColor: '#f2dbdc',
  productBgTop: 270,
  productBgWidth: 864,
  productBgHeight: 1378,
  productImageTop: 311,
  productImageWidth: 785,
  productImageHeight: 1019,
  radius: 100,
  imgRadius: 60,
  textColor: '#cd4762',
  titleFontSize: 44,
  subtitleFontSize: 26,
  productNameTop: 1385,
  productColorsTop: 1466,
  productSizesTop: 1509,
  productCodeTop: 1552,
  priceTextTop: 1670,
  discountBgTop: 400,
  discountTextTop: 400,
  marketingTextTop: 1400
};

@Component({
  standalone: true,
  template: ` <!--<form nz-form [formGroup]="storyGeneratorForm">
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
    </form>-->
    <div
      #storyElement
      style="background-color: {{ CONSTANTS.canvasBgColor }}"
      class="w-80 mx-auto text-center mt-2 bg-white px-8 relative"
    >
      <div class="h-6"></div>
      <h1 style="font-family: Candice, serif" class="text-rose-600 text-xl">HeyLee</h1>
      <div class="h-5"></div>
      <div
        style="background-color: {{ CONSTANTS.productBgColor }}"
        class="w-64 py-2 shadow mx-auto text-center rounded-xl"
      >
        <img
          [src]="stockItem.image"
          alt="Product Image"
          class="w-40 rounded-xl inline-block my-3 border-2 border-solid border-gray-100"
        />
        <div style="color: {{ CONSTANTS.textColor }}">
          <h1 class="font-bold my-1 text-inherit">{{ stockItem.name }}</h1>
          <div class="font-bold my-1">
            <span>رنگ‌ها: </span>
            @for (color of stockItem.colors; track $index) {
              <span>{{ color.label }}</span>
              <span class="last:hidden">، </span>
            }
          </div>

          <div class="font-bold my-1">
            <span>سایزها: </span>
            @for (size of allSizes; track $index) {
              <span>{{ size }}</span>
              <span class="last:hidden">، </span>
            }
          </div>

          <div>
            <span class="font-mono">{{ stockItem.code }}</span>
          </div>
        </div>
      </div>
      <div class="h-4"></div>
      <div class="text-gray-600">
        @if (storyGeneratorForm.get('discountPercentage')!.value > 0) {
          <div class="font-bold text-2xl">
            <span>فقط </span>
            {{ discountedPrice | number }}
            <span class="mx-1 opacity-70" style="font-size: 0.6rem">تومان</span>
          </div>
          <div class="inline-block relative text-sm text-rose-500 opacity-75">
            {{ stockItem.sellingUnitPrice / 10 | number }}
            <i class="fa-solid fa-xmark"></i>
          </div>
        } @else {
          <span class="font-bold text-2xl">
            {{ stockItem.sellingUnitPrice / 10 | number }}
          </span>
          <span class="mx-1 opacity-70" style="font-size: 0.6rem">تومان</span>
        }
      </div>

      @if (storyGeneratorForm.get('discountPercentage')!.value > 0) {
        <div dir="ltr" class="absolute font-bold top-28 left-14 bg-rose-500 h-7 w-20 -rotate-45 text-white rounded-lg">
          <span class="leading-none"> {{ storyGeneratorForm.get('discountPercentage')?.value }}% OFF </span>
        </div>
      }
      <div class="text-lg italic text-gray-500">
        {{ storyGeneratorForm.get('marketingDescription')?.value }}
      </div>
    </div>
    <div class="absolute hidden -top-full -left-full">
      <!--<div>-->
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
  imports: [NzButtonModule, NzFormModule, NzInputModule, NzSliderModule, ReactiveFormsModule, DecimalPipe],
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
      backgroundColor: CONSTANTS.canvasBgColor
    });

    const { name, image, sellingUnitPrice, code, colors } = this.stockItem;
    const discountPercentage = this.storyGeneratorForm.controls.discountPercentage.value;
    const marketingDescription = this.storyGeneratorForm.controls.marketingDescription.value;

    BaseFabricObject.ownDefaults.originX = 'center';

    const title = new Textbox('HeyLee', {
      top: CONSTANTS.titleTop,
      left: canvas.width / 2,
      width: 600,
      textAlign: 'center',
      fontSize: 52,
      fontFamily: 'Candice',
      borderColor: CONSTANTS.textColor,
      fill: '#e11d48'
    });
    canvas.add(title);

    const productBg = new Rect({
      top: CONSTANTS.productBgTop,
      left: canvas.width / 2,
      width: CONSTANTS.productBgWidth,
      height: CONSTANTS.productBgHeight,
      fill: CONSTANTS.productBgColor,
      rx: CONSTANTS.radius,
      ry: CONSTANTS.radius
    });
    canvas.add(productBg);

    FabricImage.fromURL(image || '', { crossOrigin: 'anonymous' })
      .then(img => {
        const scaleX = CONSTANTS.productImageWidth / img.width;
        const scaleY = CONSTANTS.productImageHeight / img.height;
        img.set({
          top: CONSTANTS.productImageTop,
          left: canvas.width / 2,
          scaleX,
          scaleY,
          selectable: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true
        });
        img.clipPath = new Rect({
          top: -img.height / 2,
          left: 0,
          width: img.width,
          height: img.height,
          fill: CONSTANTS.canvasBgColor,
          rx: CONSTANTS.imgRadius,
          ry: CONSTANTS.imgRadius,
          selectable: false,
          hasControls: false,
          hasBorders: false,
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true
        });
        canvas.add(img);
      })
      .catch(err => console.error('Error loading product image', err));

    const productName = new Textbox(name, {
      top: CONSTANTS.productNameTop,
      left: canvas.width / 2,
      direction: 'rtl',
      originX: 'center',
      width: CONSTANTS.productImageWidth - 30,
      textAlign: 'right',
      perPixelTargetFind: true,
      fontSize: CONSTANTS.titleFontSize,
      fontFamily: 'Vazirmatn',
      fontWeight: 700,
      fill: CONSTANTS.textColor
    });
    canvas.add(productName);

    const productColors = new Textbox(`رنگ‌ها: ${colors.map(color => color.label).join('، ')}`, {
      top: CONSTANTS.productColorsTop,
      left: canvas.width / 2,
      direction: 'rtl',
      width: CONSTANTS.productImageWidth - 30,
      textAlign: 'right',
      perPixelTargetFind: true,
      fontSize: CONSTANTS.subtitleFontSize,
      fontFamily: 'Vazirmatn',
      fontWeight: 700,
      fill: CONSTANTS.textColor
    });
    canvas.add(productColors);

    const productSizes = new Textbox(`سایزها: ${Array.from(this.allSizes).join('، ')}`, {
      top: CONSTANTS.productSizesTop,
      left: canvas.width / 2,
      direction: 'rtl',
      width: CONSTANTS.productImageWidth - 30,
      textAlign: 'right',
      perPixelTargetFind: true,
      fontSize: CONSTANTS.subtitleFontSize,
      fontFamily: 'Vazirmatn',
      fontWeight: 700,
      fill: CONSTANTS.textColor
    });
    canvas.add(productSizes);

    const productCode = new Textbox(code, {
      top: CONSTANTS.productCodeTop,
      left: canvas.width / 2,
      direction: 'rtl',
      width: CONSTANTS.productImageWidth - 30,
      textAlign: 'right',
      fontSize: CONSTANTS.subtitleFontSize,
      fontFamily: 'monospace',
      fill: CONSTANTS.textColor
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
        fill: CONSTANTS.textColor,
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
      fill: CONSTANTS.textColor
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

  protected readonly CONSTANTS = CONSTANTS;
}
