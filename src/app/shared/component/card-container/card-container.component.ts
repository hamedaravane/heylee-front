import { Component } from '@angular/core';

@Component({
  selector: 'card-container',
  templateUrl: './card-container.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  standalone: true
})
export class CardContainerComponent {}
