import {Component, EventEmitter, inject, OnDestroy, OnInit, Output} from '@angular/core';
import {BreakpointService} from '@shared/service/breakpoint.service';
import {PageContainerComponent} from '@shared/component/page-container/page-container.component';
import {AsyncPipe} from '@angular/common';
import {Subscription} from 'rxjs';

@Component({
  standalone: true,
  selector: 'responsive-container',
  imports: [
    PageContainerComponent,
    AsyncPipe
  ],
  template: `
    <page-container>
      <ng-content></ng-content>
    </page-container>`
})
export class ResponsiveContainerComponent implements OnInit, OnDestroy {
  private readonly breakpointService = inject(BreakpointService);
  private breakpointSubscription = new Subscription();
  @Output() isDesktopChange = new EventEmitter<boolean>();

  ngOnInit() {
    this.breakpointSubscription = this.breakpointService.isDesktop$.subscribe(isDesktop => {
      this.isDesktopChange.emit(isDesktop);
    });
  }

  ngOnDestroy() {
    this.breakpointSubscription.unsubscribe();
  }
}