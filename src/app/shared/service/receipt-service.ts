import { inject, Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private readonly nzMessageService = inject(NzMessageService);

  /**
   * Converts an HTML element to a data URL using html2canvas.
   * @param element The HTMLElement to convert.
   * @returns A Promise resolving to the data URL of the rendered element.
   * @throws Error if the element is null or conversion fails.
   */
  protected async convertToDataURL(element: HTMLElement) {
    if (!element) {
      throw new Error('Element provided for conversion is null or undefined.');
    }

    try {
      const canvasElement = await html2canvas(element, {
        backgroundColor: null,
        logging: true,
        useCORS: true,
        scale: 2,
        allowTaint: false
      });
      return canvasElement.toDataURL();
    } catch (error) {
      throw new Error('Failed to convert element to a data URL.');
    }
  }

  /**
   * Shares a file using the Web Share API.
   * @param data The data URL of the file to share.
   * @throws Error if `navigator.share` is not supported or the sharing fails.
   */
  protected async share(data: string): Promise<void> {
    if (!navigator.share) {
      throw new Error('Web Share API is not supported.');
    }

    try {
      const blob = await window.fetch(data).then(res => res.blob());
      const file = new File([blob], 'heylee-order-receipt', { type: 'image/*' });
      const shareData: ShareData = {
        text: 'جزئیات سفارش خرید شما از فروشگاه هیلی',
        files: [file]
      };

      const allSupported = Object.entries(shareData).every(([key, value]) => {
        console.warn({ [key]: value });
        return navigator.canShare({ [key]: value });
      });

      if (allSupported) {
        await navigator.share(shareData);
      }
    } catch (error) {
      console.error('Error during sharing:', error);
      throw new Error('Sharing the receipt failed.');
    }
  }

  /**
   * Generates and shares a receipt from an HTML element.
   * @param element The HTMLElement to convert and share.
   */
  async shareReceipt(element: HTMLElement) {
    if (!element) {
      throw new Error('Receipt element is missing.');
    }
    try {
      const dataURL = await this.convertToDataURL(element);
      await this.share(dataURL);
    } catch (error) {
      console.error('Error:', error);
      this.nzMessageService.error('خطا در تولید یا به اشتراک گذاری رسید رخ داد!');
    }
  }
}
