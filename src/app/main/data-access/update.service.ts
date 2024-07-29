import {SwUpdate} from '@angular/service-worker';
import {inject, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private readonly swUpdate = inject(SwUpdate);

  checkForUpdates() {
    return this.swUpdate.checkForUpdate()
  }

  updateApplication() {
    this.swUpdate.activateUpdate().then(() => {
      window.location.reload();
    });
  }
}