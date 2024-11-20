import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FilterIndex } from '@shared/entity/common.entity';
import { map, Observable } from 'rxjs';
import { dtoConvertor, IndexResponse, ServerResponse } from '@shared/entity/server-response.entity';
import { environment } from '@environment';

@Injectable({
  providedIn: 'root'
})
export class BaseInfra {
  protected readonly http = inject(HttpClient);

  protected fetchEntities<TDto, TDomain>(
    endpoint: string,
    dtoToDomainMapper: (dto: TDto) => TDomain,
    page: number = 1,
    filters?: FilterIndex<TDto>[],
    sort: string = '-created_at',
    expand: string = '',
    perPage: number = 100
  ): Observable<IndexResponse<TDomain>> {
    let params = new HttpParams().set('page', page).set('per-page', perPage);

    if (expand) {
      params = params.append('expand', expand);
    }

    params = params.append('sort', sort);

    if (filters && filters.length > 0) {
      for (const filter of filters) {
        params = params.append(`filter[${filter.prop as string}][${filter.operator}]`, `${filter.value}`);
      }
    }

    return this.http
      .get<ServerResponse<IndexResponse<TDto>>>(`${environment.apiUrl}/${endpoint}/index`, { params })
      .pipe(
        map(res => {
          if (res.ok) {
            return dtoConvertor(res.result, indexResponse => {
              return {
                ...indexResponse,
                items: indexResponse.items.map(dtoToDomainMapper)
              };
            });
          } else {
            throw res.result as unknown;
          }
        })
      );
  }

  protected createEntity<TCreateDto, TDto, TDomain>(
    endpoint: string,
    payload: TCreateDto | FormData,
    dtoToDomainMapper: (dto: TDto) => TDomain,
    toDtoConverter?: (domain: TDomain) => TCreateDto
  ): Observable<TDomain> {
    const data = toDtoConverter ? toDtoConverter(payload as TDomain) : payload;

    return this.http.post<ServerResponse<TDto>>(`${environment.apiUrl}/${endpoint}/create`, data).pipe(
      map(res => {
        if (res.ok) {
          return dtoToDomainMapper(res.result);
        } else {
          throw res.result as unknown;
        }
      })
    );
  }

  protected updateEntity<TUpdateDto, TDto, TDomain>(
    endpoint: string,
    id: number,
    payload: TUpdateDto | FormData,
    dtoToDomainMapper: (dto: TDto) => TDomain,
    toDtoConverter?: (domain: TDomain) => TUpdateDto
  ): Observable<TDomain> {
    const data = toDtoConverter ? toDtoConverter(payload as TDomain) : payload;

    return this.http.post<ServerResponse<TDto>>(`${environment.apiUrl}/${endpoint}/update/${id}`, data).pipe(
      map(res => {
        if (res.ok) {
          return dtoToDomainMapper(res.result);
        } else {
          throw res.result as unknown;
        }
      })
    );
  }

  protected deleteEntity<TDto>(endpoint: string, id: number): Observable<void> {
    return this.http.delete<ServerResponse<TDto>>(`${environment.apiUrl}/${endpoint}/delete/${id}`).pipe(
      map(res => {
        if (res.ok) {
          return;
        } else {
          throw res.result as unknown;
        }
      })
    );
  }
}
