import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  constructor(private message: NzMessageService) {}

  /**
   * Captures the ReceiptComponent as an image and shares it.
   * @param receiptElement The DOM element of the ReceiptComponent.
   */
  async shareReceipt(receiptElement: HTMLElement) {
    await this.replaceImagesWithDataURIs(receiptElement);

    if (!this.isShareAvailable()) {
      this.message.error('امکان اشتراک‌گذاری در این مرورگر وجود ندارد.');
      return;
    }

    try {
      // Capture the receipt element as an image
      const canvas = await html2canvas(receiptElement, { useCORS: true });
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'));

      if (!blob) {
        this.message.error('خطا در ایجاد تصویر رسید.');
        return;
      }

      const file = new File([blob], 'receipt.png', { type: 'image/png' });
      const shareData: ShareData = {
        files: [file],
        title: 'رسید خرید',
        text: 'رسید خرید شما'
      };

      if (!this.canShareData(shareData)) {
        this.message.error('امکان اشتراک‌گذاری این داده‌ها وجود ندارد.');
        return;
      }

      await navigator.share(shareData);
      this.message.success('رسید با موفقیت به اشتراک گذاشته شد.');
    } catch (e) {
      const error = e as Error;
      if (error.name === 'AbortError') {
        // User canceled the share action
        this.message.info('اشتراک‌گذاری لغو شد.');
      } else {
        this.message.error('خطا در اشتراک‌گذاری رسید.');
        console.error('Error sharing receipt:', error);
      }
    }
  }

  private async replaceImagesWithDataURIs(element: HTMLElement) {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map(async (img) => {
      try {
        const dataURL = await this.convertImageToDataURL(img.src);
        img.src = dataURL;
      } catch (error) {
        console.error('Error converting image to data URL:', error);
        // Optionally handle errors, e.g., remove the image or show a placeholder
      }
    });
    await Promise.all(promises);
  }

  private async convertImageToDataURL(url: string): Promise<string> {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Failed to load image: ${url}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Checks if the Web Share API is available in the browser.
   */
  private isShareAvailable(): boolean {
    return !!navigator.share;
  }

  /**
   * Checks if the provided share data can be shared by the browser.
   * @param shareData The data intended to be shared.
   */
  private canShareData(shareData: ShareData): boolean {
    if (!navigator.canShare) {
      // If canShare is not available, assume basic data can be shared
      return true;
    }

    try {
      return navigator.canShare(shareData);
    } catch (error) {
      return false;
    }
  }
}
