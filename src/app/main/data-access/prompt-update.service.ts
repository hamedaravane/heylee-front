import {SwUpdate, VersionReadyEvent} from '@angular/service-worker';
import {Injectable} from '@angular/core';
import {filter} from 'rxjs';

@Injectable({providedIn: 'root'})
export class PromptUpdateService {
  constructor(swUpdate: SwUpdate) {
    function promptUser(evt: VersionReadyEvent) {
      const currentVersion = evt.currentVersion.hash;
      const newVersion = evt.latestVersion.hash;
      console.log(`Current version: ${currentVersion}, New version: ${newVersion}`);
      return confirm(`Update available! Would you like to update now?`);
    }

    swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe((evt) => {
        if (promptUser(evt)) {
          document.location.reload();
        }
      });
  }
}
