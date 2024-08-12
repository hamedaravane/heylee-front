import {HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

export function AuthenticationInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {'Authorization': `Bearer ${authToken}`}
    });
    return next(authReq);
  }
  return next(req);
}
