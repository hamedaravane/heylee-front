import { Component } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

@Component({
  selector: 'main',
  standalone: true,
  imports: [NzLayoutModule, RouterOutlet, NgOptimizedImage, NzGridModule, NzBadgeModule, RouterLink, AsyncPipe],
  templateUrl: './main.component.html',
  styles: ':host { height: 100% }'
})
export class MainComponent {
  goBack() {
    history.back();
  }
}
