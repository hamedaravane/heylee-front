import {Component} from '@angular/core';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {RouterLink} from '@angular/router';
import {NzGridModule} from 'ng-zorro-antd/grid';

@Component({
  selector: 'welcome',
  standalone: true,
  imports: [NzButtonModule, NzGridModule, RouterLink],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {}
