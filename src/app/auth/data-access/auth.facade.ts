import { inject, Injectable } from '@angular/core';
import { AuthInfra } from '../infrastructure/auth.infra';
import { AuthRequest, AuthToken, User } from '../entity/auth.entity';
import { firstValueFrom, Subject } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  private readonly nzMessageService = inject(NzMessageService);
  private readonly authFacade = inject(AuthInfra);
  private readonly userSubject = new Subject<User>();
  private readonly authTokenSubject = new Subject<AuthToken>();
  private readonly loginLoadingSubject = new Subject<boolean>();

  get user$() {
    return this.userSubject.asObservable();
  }

  get authToken$() {
    return this.authTokenSubject.asObservable();
  }

  get loginLoading$() {
    return this.loginLoadingSubject.asObservable();
  }

  get isOperator() {
    return Boolean(localStorage.getItem('isOperator'));
  }

  get activePages() {
    if (localStorage.getItem('activePages') === null) {
      return [];
    }
    return localStorage.getItem('activePages')!.split(',');
  }

  async login(authRequest: AuthRequest): Promise<void> {
    this.loginLoadingSubject.next(true);
    try {
      const { user, authToken } = await firstValueFrom(this.authFacade.login(authRequest));
      this.userSubject.next(user);
      this.authTokenSubject.next(authToken);
      if (user.id === 4) {
        localStorage.setItem('activePages', 'sale,product,invoices,inventory,customer,transaction');
        localStorage.setItem('isOperator', 'true');
      } else {
        localStorage.setItem(
          'activePages',
          'sale,invoices,inventory,product,purchase,supplier,customer,purchase-receipt,statistic,transaction'
        );
        localStorage.setItem('isOperator', 'false');
      }
      localStorage.setItem('username', user.username);
      localStorage.setItem('authToken', authToken.token);
      localStorage.setItem('authTokenExpiresAt', authToken.expiresAt.toString());
    } catch (e) {
      const err = e as Error;
      console.error('Login failed:', err);
      this.nzMessageService.error(err.message);
    } finally {
      this.loginLoadingSubject.next(false);
    }
  }

  getStoredAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getStoredAuthTokenExpiresAt(): number | null {
    const expiresAt = localStorage.getItem('authTokenExpiresAt');
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  }
}
