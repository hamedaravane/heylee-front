import {Injectable} from '@angular/core';
import {fromEvent} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  screenWidth$(): void {
    fromEvent(window, 'onresize').subscribe(value => {
      console.log(value.target);
    });
  }
}