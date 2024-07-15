import {inject, Injectable} from "@angular/core";
import {map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "@environment";
import {AuthRequest, AuthResponseDTO, AuthToken, mapAuthResponseDTOToModels, User} from "../entity/auth.entity";

@Injectable({
  providedIn: 'root'
})
export class AuthInfra {
  private readonly http = inject(HttpClient);

  login(authRequest: AuthRequest): Observable<{ user: User, authToken: AuthToken }> {
    return this.http.post<AuthResponseDTO>(`${environment.apiUrl}/auth/login`, authRequest)
      .pipe(
        map(response => mapAuthResponseDTOToModels(response))
      );
  }
}
