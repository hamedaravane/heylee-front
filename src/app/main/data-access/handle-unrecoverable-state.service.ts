import {SwUpdate} from '@angular/service-worker';
import {Injectable} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd/message';

@Injectable({providedIn: 'root'})
export class HandleUnrecoverableStateService {
  constructor(updates: SwUpdate, nzMessageService: NzMessageService) {
    updates.unrecoverable.subscribe((event) => {
      nzMessageService.info(
        'An error occurred that we cannot recover from:\n' +
        event.reason +
        '\n\nPlease reload the page.',
      );
    });
  }
}