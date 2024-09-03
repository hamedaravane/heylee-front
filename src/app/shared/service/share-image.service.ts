import {inject, Injectable} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import * as htmlToImage from 'html-to-image';

@Injectable({
  providedIn: 'root'
})
export class ShareImageService {
  private readonly nzMessageService = inject(NzMessageService);

  generateDataUrl(element: HTMLElement) {
    return htmlToImage.toPng(element);
  }

  generateBlob(element: HTMLElement) {
    return htmlToImage.toBlob(element) as Promise<Blob>;
  }

  blobToFile(blob: Blob) {
    return new File([blob], 'receipt', {type: 'image/png'});
  }

  generateShareData(element: HTMLElement) {

  }

  downloadImage(element: HTMLElement, fileName: string) {
    this.generateDataUrl(element).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    }).catch((e) => {
      console.error(`Error: ${e}`);
      const error = e as Error;
      this.nzMessageService.error(error.message);
    })
  }

  canBrowserShareData(data: ShareData) {
    if (!navigator.share || !navigator.canShare) {
      return false;
    }
    return navigator.canShare(data);
  }

  isDesktop() {
    return window.innerWidth > 768;
  }

  async shareData(data: ShareData) {
    try {
      await navigator.share(data);
    } catch (e) {
      console.error(`Error: ${e}`);
      const error = e as Error;
      this.nzMessageService.error(error.message);
    }
  }
}