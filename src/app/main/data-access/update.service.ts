import { SwUpdate } from '@angular/service-worker';
import { inject, Injectable, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private readonly swUpdate = inject(SwUpdate);

  checkForUpdates() {
    if (!isDevMode()) {
      return this.swUpdate.checkForUpdate();
    }
    return new Promise<boolean>(() => false);
  }

  updateApplication() {
    this.swUpdate.activateUpdate().then(() => {
      window.location.reload();
    });
  }
}
