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
  protected async convertToDataURL(element: HTMLElement): Promise<string> {
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
      if (canvasElement) {
        return canvasElement.toDataURL('image/png', 1);
      }
      console.error('Canvas generation returned an invalid result.');
    } catch (error) {
      console.error('Error during HTML to canvas conversion:', error);
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
      this.nzMessageService.error('Sharing is not supported in this browser.');
      throw new Error('Web Share API is not supported.');
    }

    try {
      const blob = new Blob([data]);
      const file = new File([blob], 'heylee-receipt.png', { type: 'image/png' });
      const shareData: ShareData = {
        text: 'جزئیات سفارش خرید شما از فروشگاه هیلی',
        files: [file]
      };

      const allSupported = Object.entries(shareData).every(([key, value]) => {
        console.warn({ [key]: value });
        return navigator.canShare({ [key]: value });
      });

      if (allSupported && navigator.share) {
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
  async shareReceipt(element: HTMLElement): Promise<void> {
    if (!element) {
      this.nzMessageService.error('Receipt element is missing.');
    }
    try {
      const dataURL = await this.convertToDataURL(element);
      await this.share(dataURL);
    } catch (error) {
      console.error('Error in shareReceipt:', error);
      this.nzMessageService.error('An error occurred while generating or sharing the receipt.');
    }
  }
}
