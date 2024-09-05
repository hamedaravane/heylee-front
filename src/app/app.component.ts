import {Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {UpdateService} from './main/data-access/update.service';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzNotificationComponent, NzNotificationService} from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NzButtonModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  @ViewChild('updateBtnRef', {static: true}) updateBtnRef!: TemplateRef<{
    $implicit: NzNotificationComponent
  }>;
  private readonly updateService = inject(UpdateService);
  private readonly nzNotificationService = inject(NzNotificationService);
  title = 'Hey Lee';

  ngOnInit() {
    this.updateService.checkForUpdates().then((u) => {
      if (u) {
        this.nzNotificationService.blank('new version is available.',
          {
            nzPlacement: 'bottom',
            nzKey: 'UPDATE',
            nzDuration: 0,
            nzAnimate: true,
            nzButton: this.updateBtnRef,
          }
        ).onClick.subscribe(() => this.updateApplication());
      }
    });
  }

  updateApplication() {
    this.updateService.updateApplication();
  }
}
