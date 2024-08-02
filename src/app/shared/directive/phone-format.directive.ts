import {Directive, ElementRef, HostListener, inject, Renderer2} from "@angular/core";

@Directive({
  standalone: true,
  selector: 'phoneFormat',
})
export class PhoneFormatDirective {
  private readonly el!: ElementRef;
  private readonly renderer = inject(Renderer2);

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    const hasPlusSign = input.value.startsWith('+');
    if (hasPlusSign) {
      value = '+' + value;
    }

    if (value.length > 0) {
      let formattedValue = '';
      if (hasPlusSign) {
        formattedValue = value.slice(0, 3) + ' ';
        value = value.slice(3);
      }
      const chunks = value.match(/.{1,3}/g);
      if (chunks) {
        formattedValue += chunks.join(' ');
      }
      value = formattedValue.trim();
    }

    this.renderer.setProperty(this.el.nativeElement, 'value', value);
  }
}
