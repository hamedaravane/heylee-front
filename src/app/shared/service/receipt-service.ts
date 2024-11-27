import { inject, Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root',
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
      const canvasElement = await html2canvas(element, { backgroundColor: null, logging: true });
      if (canvasElement) {
        return canvasElement.toDataURL();
      }
      throw new Error('Canvas generation returned an invalid result.');
    } catch (error) {
      console.error('Error during HTML to canvas conversion:', error);
      throw new Error('Failed to convert element to a data URL.');
    }
  }

  /**
   * Shares a file using the Web Share API.
   * @param data The data URL of the file to share.
   * @param title Optional title for the shared data.
   * @param text Optional text accompanying the shared data.
   * @throws Error if navigator.share is not supported or the sharing fails.
   */
  protected async share(data: string, title?: string, text?: string): Promise<void> {
    if (!navigator.share) {
      this.nzMessageService.error('Sharing is not supported in this browser.');
      throw new Error('Web Share API is not supported.');
    }

    try {
      const blob = await fetch(data).then((res) => res.blob()); // Convert data URL to blob
      const file = new File([blob], 'receipt.png', { type: 'image/png' });
      const shareData: ShareData = {
        title: title || 'سفارش خرید شما',
        text: text || 'با تشکر از خرید شما',
        files: [file],
        url: 'https://www.instagram.com/heylee.closet/', // Optional URL
      };

      await navigator.share(shareData);
      this.nzMessageService.success('Receipt shared successfully.');
    } catch (error) {
      console.error('Error during sharing:', error);
      this.nzMessageService.error('Failed to share the receipt.');
      throw new Error('Sharing the receipt failed.');
    }
  }

  /**
   * Generates and shares a receipt from an HTML element.
   * @param element The HTMLElement to convert and share.
   * @param title Optional title for the shared data.
   * @param text Optional text accompanying the shared data.
   * @param cb Optional callback to execute after operation.
   */
  async shareReceipt(element: HTMLElement, title?: string, text?: string, cb?: () => void): Promise<void> {
    try {
      if (!element) {
        this.nzMessageService.error('Receipt element is missing.');
        throw new Error('Element is required for sharing a receipt.');
      }

      const dataURL = await this.convertToDataURL(element);
      await this.share(dataURL, title, text);
    } catch (error) {
      console.error('Error in shareReceipt:', error);
      this.nzMessageService.error('An error occurred while generating or sharing the receipt.');
    } finally {
      if (cb) cb();
    }
  }
}
