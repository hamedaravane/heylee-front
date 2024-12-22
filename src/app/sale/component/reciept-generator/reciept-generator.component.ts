import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild
} from '@angular/core';
import {
  BaseFabricObject,
  Canvas,
  FabricImage,
  FabricText,
  Rect,
  Textbox
} from 'fabric';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe, DatePipe } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { StockItemSelection } from '@inventory/entity/inventory.entity';

function toPersianDigitWithSeparator(num: number): string {
  const formattedNumber = num.toLocaleString('en-US');
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return formattedNumber
    .replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)])
    .replace('.', ',');
}

// Here, define all your constants for receipt layout
const RECEIPT_CONSTANTS = {
  canvasWidth: 1080,
  canvasHeight: 1800,
  canvasBgColor: '#ffffff',
  headerBgColor: '#6366F1',  // Indigo
  headerHeight: 180,
  logoTop: 80,
  userTop: 80,
  userRight: 50,
  tableTop: 350,
  tableLeft: 100,
  rowHeight: 90,
  columnWidths: {
    image: 120,
    product: 550,
    price: 300
  },
  // Pricing summary positions
  summaryBoxTop: 1100,
  summaryLeft: 100,
  summaryWidth: 880,
  summaryHeight: 300,
  footerTop: 1500
};

@Component({
  standalone: true,
  selector: 'receipt-generator',
  template: `
    <!-- You can display a little preview of the receipt if you want -->
    <div class="text-center mt-4">
      <button (click)="downloadReceipt()" nz-button nzType="default" type="button" class="me-4">
        <span>دانلود رسید</span>
        <i class="fa-solid fa-download ms-2"></i>
      </button>
      <button (click)="shareReceipt()" nz-button nzType="primary" type="button">
        <span>اشتراک گذاری</span>
        <i class="fa-solid fa-share ms-2"></i>
      </button>
    </div>
    <!-- Canvas is placed out of normal view (or in a hidden container) -->
    <div style="position: absolute; top: -9999px; left: -9999px;">
      <canvas #receiptCanvas></canvas>
    </div>
  `,
  imports: [
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSliderModule,
    ReactiveFormsModule,
    DecimalPipe,
    DatePipe
  ]
})
export class ReceiptGeneratorComponent implements AfterViewInit {
  @ViewChild('receiptCanvas', { static: false }) receiptCanvas!: ElementRef<HTMLCanvasElement>;

  private readonly destroyRef = inject(DestroyRef);

  canvas: Canvas | null = null;

  // Sample data. In a real scenario, you might pass these in via @Input() or read from history.state.
  // Adjust as needed for your actual use-case.
  customerName = 'John Doe';
  address = 'تهران، خیابان آزادی، کوچه بهار، پلاک ۱۲';
  shippingPrice = 20000;   // e.g., 20,000 Rial
  discount = 10000;        // e.g., 10,000 Rial
  today = new Date();
  selectedProducts: StockItemSelection[] = [
    {
      product: {
        id: 1,
        code: 'P-101',
        name: 'کفش اسپرت',
        description: 'یک کفش اسپرت عالی',
        image: 'https://picsum.photos/300/300?random=1', // sample image
        // createdAt, updatedAt not needed in Omit
      },
      color: { id: 1, label: 'قرمز' },
      size: { id: 1, label: '۴۰' },
      availableQuantity: 100,
      sellingUnitPrice: 350000, // Rials
      selectedQuantity: 1
    },
    {
      product: {
        id: 2,
        code: 'P-202',
        name: 'تیشرت نخی مردانه',
        description: 'مناسب برای تابستان',
        image: 'https://picsum.photos/300/300?random=2',
      },
      color: { id: 2, label: 'آبی' },
      size: { id: 2, label: 'L' },
      availableQuantity: 50,
      sellingUnitPrice: 150000,
      selectedQuantity: 2
    }
  ];

  // Example reactive form if you want dynamic changes (or you can skip the form entirely)
  receiptForm = new FormGroup({
    note: new FormControl<string>('')
  });

  get totalOrderPrice(): number {
    // Simple calculation; sum of each product's price * quantity
    return this.selectedProducts.reduce(
      (acc, item) => acc + item.sellingUnitPrice * item.selectedQuantity,
      0
    );
  }

  get customerPayment(): number {
    // total + shipping - discount
    return this.totalOrderPrice + this.shippingPrice - this.discount;
  }

  ngAfterViewInit() {
    this.generateCanvas();

    // If fonts or form changes happen, re-generate the canvas
    fromEvent(document.fonts as any, 'loadingdone')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.regenerateCanvas();
      });

    this.receiptForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), distinctUntilChanged())
      .subscribe(() => {
        this.regenerateCanvas();
      });
  }

  private regenerateCanvas() {
    this.canvas?.clear();
    this.generateCanvas();
  }

  private generateCanvas(): void {
    // Dispose old canvas if it exists
    this.canvas?.dispose();

    // Create the Fabric canvas
    const canvas = new Canvas(this.receiptCanvas.nativeElement, {
      width: RECEIPT_CONSTANTS.canvasWidth,
      height: RECEIPT_CONSTANTS.canvasHeight,
      backgroundColor: RECEIPT_CONSTANTS.canvasBgColor
    });

    // Set default origin to "top-left" or "center" as desired
    BaseFabricObject.ownDefaults.originX = 'left';
    BaseFabricObject.ownDefaults.originY = 'top';

    // ==============
    // 1) Header
    // ==============
    const headerBg = new Rect({
      left: 0,
      top: 0,
      width: RECEIPT_CONSTANTS.canvasWidth,
      height: RECEIPT_CONSTANTS.headerHeight,
      fill: RECEIPT_CONSTANTS.headerBgColor
    });
    canvas.add(headerBg);

    const logoText = new FabricText('HeyLee', {
      left: RECEIPT_CONSTANTS.canvasWidth / 2,
      top: RECEIPT_CONSTANTS.logoTop,
      originX: 'center',
      fontSize: 60,
      fill: '#FBCFE8', // e.g., rose-200
      fontFamily: 'Candice, serif'
    });
    canvas.add(logoText);

    // Customer name on the left or right, date on the opposite side
    const nameText = new FabricText(this.customerName, {
      left: 50,
      top: RECEIPT_CONSTANTS.userTop,
      fontSize: 32,
      fill: '#FFFFFF',
      fontWeight: 'bold'
    });
    canvas.add(nameText);

    const datePipe = new DatePipe('fa-IR'); // Persian locale if desired
    const dateText = new FabricText(datePipe.transform(this.today, 'fullDate') || '', {
      left: RECEIPT_CONSTANTS.canvasWidth - RECEIPT_CONSTANTS.userRight - 200,
      top: RECEIPT_CONSTANTS.userTop + 6,
      fontSize: 20,
      fill: '#FFFFFF'
    });
    canvas.add(dateText);

    // ==============
    // 2) Products Table
    // ==============
    // Table header row
    const tableHeaderBg = new Rect({
      left: RECEIPT_CONSTANTS.tableLeft,
      top: RECEIPT_CONSTANTS.tableTop,
      width:
        RECEIPT_CONSTANTS.columnWidths.image +
        RECEIPT_CONSTANTS.columnWidths.product +
        RECEIPT_CONSTANTS.columnWidths.price,
      height: RECEIPT_CONSTANTS.rowHeight,
      fill: '#F1F5F9' // e.g., gray-100
    });
    canvas.add(tableHeaderBg);

    const headerCols = ['تصویر', 'محصول', 'قیمت'];
    let colPos = RECEIPT_CONSTANTS.tableLeft;
    [RECEIPT_CONSTANTS.columnWidths.image, RECEIPT_CONSTANTS.columnWidths.product, RECEIPT_CONSTANTS.columnWidths.price].forEach((w, idx) => {
      const cellText = new FabricText(headerCols[idx], {
        left: colPos + 10,
        top: RECEIPT_CONSTANTS.tableTop + 25, // some padding
        fontSize: 24,
        fill: '#374151', // gray-700
      });
      canvas.add(cellText);
      colPos += w;
    });

    // Table content (rows)
    let currentTop = RECEIPT_CONSTANTS.tableTop + RECEIPT_CONSTANTS.rowHeight;
    this.selectedProducts.forEach((item, i) => {
      // 2.1) Image
      FabricImage.fromURL(item.product.image || '', { crossOrigin: 'anonymous' })
        .then((img) => {
          // Fit the image into our 80x80 cell
          const scaleFactor = Math.min(80 / img.width!, 80 / img.height!);
          img.scale(scaleFactor);
          img.set({
            left: RECEIPT_CONSTANTS.tableLeft + 10,
            top: currentTop + 5,
            selectable: false
          });
          canvas.add(img);
        })
        .catch((err) => console.error('Error loading product image', err));

      // 2.2) Product Description
      const productDesc = `
${item.product.name}
تعداد: ${item.selectedQuantity} | رنگ: ${item.color.label} | سایز: ${item.size.label}`;
      const productText = new Textbox(productDesc, {
        left: RECEIPT_CONSTANTS.tableLeft + RECEIPT_CONSTANTS.columnWidths.image + 10,
        top: currentTop + 10,
        width: RECEIPT_CONSTANTS.columnWidths.product - 20,
        fontSize: 22,
        fill: '#374151',
        direction: 'rtl',
        textAlign: 'right'
      });
      canvas.add(productText);

      // 2.3) Price
      const priceTextVal = toPersianDigitWithSeparator(item.sellingUnitPrice) + ' ریال';
      const priceText = new FabricText(priceTextVal, {
        left:
          RECEIPT_CONSTANTS.tableLeft +
          RECEIPT_CONSTANTS.columnWidths.image +
          RECEIPT_CONSTANTS.columnWidths.product +
          20,
        top: currentTop + 30,
        fontSize: 24,
        fill: '#111827', // gray-900
        originX: 'right'
      });
      canvas.add(priceText);

      // 2.4) A small separator line
      const rowSeparator = new Rect({
        left: RECEIPT_CONSTANTS.tableLeft,
        top: currentTop + RECEIPT_CONSTANTS.rowHeight - 1,
        width:
          RECEIPT_CONSTANTS.columnWidths.image +
          RECEIPT_CONSTANTS.columnWidths.product +
          RECEIPT_CONSTANTS.columnWidths.price,
        height: 1,
        fill: '#E5E7EB'
      });
      canvas.add(rowSeparator);

      currentTop += RECEIPT_CONSTANTS.rowHeight;
    });

    // ==============
    // 3) Summary Box
    // ==============
    const summaryBox = new Rect({
      left: RECEIPT_CONSTANTS.summaryLeft,
      top: RECEIPT_CONSTANTS.summaryBoxTop,
      width: RECEIPT_CONSTANTS.summaryWidth,
      height: RECEIPT_CONSTANTS.summaryHeight,
      fill: '#F9FAFB' // gray-50
    });
    canvas.add(summaryBox);

    // Summaries: "مجموع"، "هزینه ارسال"، "تخفیف"، "جمع کل"
    const texts = [
      `مجموع: ${toPersianDigitWithSeparator(this.totalOrderPrice)} ریال`,
      `هزینه ارسال: ${toPersianDigitWithSeparator(this.shippingPrice)} ریال`,
      ...(this.discount > 0
        ? [`تخفیف: ${toPersianDigitWithSeparator(this.discount)} ریال`]
        : []),
      `جمع کل: ${toPersianDigitWithSeparator(this.customerPayment)} ریال`
    ];

    let sumLineTop = RECEIPT_CONSTANTS.summaryBoxTop + 30;
    texts.forEach((t, idx) => {
      const lineText = new FabricText(t, {
        left: RECEIPT_CONSTANTS.summaryLeft + 40,
        top: sumLineTop,
        fontSize: idx === texts.length - 1 ? 32 : 28,
        fontWeight: idx === texts.length - 1 ? 'bold' : 'normal',
        fill: '#111827'
      });
      canvas.add(lineText);
      sumLineTop += 60;
    });

    // ==============
    // 4) Address
    // ==============
    const addressLabel = new FabricText('آدرس ارسال:', {
      left: RECEIPT_CONSTANTS.summaryLeft + 40,
      top: sumLineTop + 20,
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#374151'
    });
    canvas.add(addressLabel);

    const addressText = new Textbox(this.address, {
      left: RECEIPT_CONSTANTS.summaryLeft + 40,
      top: sumLineTop + 60,
      width: RECEIPT_CONSTANTS.summaryWidth - 80,
      fontSize: 22,
      fill: '#4B5563',
      direction: 'rtl',
      textAlign: 'right'
    });
    canvas.add(addressText);

    // ==============
    // 5) Footer
    // ==============
    const footerText = new FabricText('ازینکه ما را انتخاب کردید سپاسگزاریم ❤️', {
      left: RECEIPT_CONSTANTS.canvasWidth / 2,
      top: RECEIPT_CONSTANTS.footerTop,
      originX: 'center',
      fontSize: 32,
      fill: '#DC2626', // rose-600 or similar
      fontFamily: 'Vazirmatn'
    });
    canvas.add(footerText);

    // If you want to add user note from the form
    if (this.receiptForm.value.note) {
      const noteBox = new Textbox(`یادداشت مشتری: ${this.receiptForm.value.note}`, {
        left: RECEIPT_CONSTANTS.summaryLeft + 40,
        top: RECEIPT_CONSTANTS.footerTop - 100,
        width: RECEIPT_CONSTANTS.summaryWidth - 80,
        fontSize: 22,
        fill: '#6B7280',
        direction: 'rtl',
        textAlign: 'right'
      });
      canvas.add(noteBox);
    }

    // Finally, render
    this.canvas = canvas;
    this.canvas.renderAll();
  }

  downloadReceipt() {
    if (!this.canvas) return;

    const dataURL = this.receiptCanvas.nativeElement.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'receipt.png';
    link.click();
  }

  async shareReceipt() {
    if (!this.canvas) return;

    const blob = await new Promise<Blob | null>((resolve) =>
      this.canvas?.toCanvasElement().toBlob((b) => resolve(b), 'image/png')
    );

    if (!blob) {
      console.error('Failed to create Blob from canvas');
      return;
    }

    if (navigator.share) {
      const file = new File([blob], 'receipt.png', { type: 'image/png' });

      try {
        await navigator.share({
          files: [file]
        });
        console.log('Receipt image shared successfully');
      } catch (error) {
        console.error('Error sharing receipt image:', error);
      }
    } else {
      console.error('Web Share API not supported in this browser');
    }
  }
}
