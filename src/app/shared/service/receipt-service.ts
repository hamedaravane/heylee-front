import { inject, Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class ReceiptService {
  private readonly nzMessageService = inject(NzMessageService);

  protected async convertToDataURL(element: HTMLElement) {
    const canvasElement = await html2canvas(element, { backgroundColor: null, logging: true });
    if (canvasElement) {
      return canvasElement.toDataURL();
    }
    throw new Error('Error in converting to data url');
  }

  protected share(data: string, title?: string, text?: string) {
    const blob = new Blob([data], { type: 'image/png' });
    const file = new File([blob], 'receipt.png', { type: 'image/png' });
    const shareData: ShareData = {
      title: title || 'سفارش خرید شما',
      text: text || 'با تشکر از خرید شما',
      files: [file],
      url: 'https://www.instagram.com/heylee.closet/'
    };
    navigator.share(shareData);
  }

  async shareReceipt(element: HTMLElement, title?: string, text?: string, cb?: () => void) {
    try {
      const dataURL = await this.convertToDataURL(element);
      this.share(dataURL, title, text)
    } catch (e) {
      console.error(e)
    } finally {
      cb && cb();
    }
  }
}
