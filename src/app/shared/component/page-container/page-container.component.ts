import { Component } from '@angular/core';

@Component({
  selector: 'page-container',
  templateUrl: './page-container.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  standalone: true
})
export class PageContainerComponent {}
