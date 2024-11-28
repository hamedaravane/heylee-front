import { Component, Input } from '@angular/core';
import { NzImageModule } from 'ng-zorro-antd/image';
import { fallbackImageBase64 } from '@shared/constant/fallbackImage';

@Component({
  standalone: true,
  selector: 'product-image-container',
  imports: [NzImageModule],
  template: `<img
    nz-image
    [nzSrc]="imageSrc ?? fallbackImageBase64"
    [src]="fallbackImageBase64"
    [nzFallback]="fallbackImageBase64"
    [nzDisablePreview]="false"
    width="46"
    height="46"
    class="max-h-12 inline-block object-cover overflow-clip rounded-md border border-solid border-gray-400"
    alt=""
  />`
})
export class ProductImageContainerComponent {
  @Input({ required: true }) imageSrc: string | null = null;
  protected readonly fallbackImageBase64 = fallbackImageBase64;
}
