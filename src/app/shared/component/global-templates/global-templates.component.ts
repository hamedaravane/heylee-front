import {Component, TemplateRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-global-templates',
  templateUrl: './global-templates.component.html',
  standalone: true
})
export class GlobalTemplatesComponent {
  @ViewChild('emptyRef', {static: true}) emptyRef!: TemplateRef<string>;
}