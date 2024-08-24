import {inject, Injectable} from '@angular/core';
import {AuthFacade} from '@auth/data-access/auth.facade';

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private readonly authFacade = inject(AuthFacade);

  get user$() {
    return this.authFacade.user$;
  }

  get operatorUser(): boolean {
    return this.authFacade.isOperator;
  }

  get activePages(): Array<string> {
    return this.authFacade.activePages;
  }

  logout() {
    this.authFacade.logout();
  }
}