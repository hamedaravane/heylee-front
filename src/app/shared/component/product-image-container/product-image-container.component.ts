import {Component, Input} from '@angular/core';

@Component({
  standalone: true,
  selector: 'product-image-container',
  template: `
    <div
        class="h-12 w-12 text-center content-center inline-block overflow-clip rounded-md border border-solid border-gray-600">
      @if (imageSrc) {
        <img [src]="imageSrc"
             class="w-12 h-full object-cover"
             alt="product image"/>
      } @else {
        <i class="fa-solid fa-image fa-xl text-gray-400"></i>
      }
    </div>`
})
export class ProductImageContainerComponent {
  @Input({required: true}) imageSrc: string | null = null;
}