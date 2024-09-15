import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {
  constructor(private breakpointObserver: BreakpointObserver) {}

  get isDesktop$(): Observable<boolean> {
    return this.breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge]).pipe(map(res => res.matches))
  }
}
