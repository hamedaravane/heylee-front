import { Component } from '@angular/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'main',
  standalone: true,
  imports: [NzLayoutModule, RouterOutlet, NgOptimizedImage],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {}