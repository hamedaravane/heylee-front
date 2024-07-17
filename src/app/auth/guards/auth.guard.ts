import {inject, Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthFacade} from '../data-access/auth.facade';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  canActivate() {
    const token = this.authFacade.getStoredAuthToken();

    if (token) {
      return true;
    } else {
      this.router.navigate(['/login']).then();
      return false;
    }
  }
}
