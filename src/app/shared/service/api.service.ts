import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {FilterIndex} from '@shared/entity/common.entity';
import {map, Observable} from 'rxjs';
import {dtoConvertor, IndexResponse, ServerResponse} from '@shared/entity/server-response.entity';
import {environment} from '@environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);

  /**
   * Fetches a paginated list of entities from the specified API endpoint.
   *
   * This method is designed to generalize HTTP GET requests for various entities,
   * applying pagination, filtering, sorting, and optional expansions. It maps
   * the DTO (Data Transfer Object) returned from the API to the domain model
   * used within the application.
   *
   * @template TDto - The type of the DTO (Data Transfer Object) returned by the API.
   * @template TDomain - The type of the domain model used within the application.
   *
   * @param {string} endpoint - The API endpoint to fetch data from (e.g., 'supplier/index').
   * @param {function(TDto): TDomain} dtoToDomainMapper - A function that maps a DTO object to a domain model object.
   * @param {number} [pageIndex=1] - The page index for pagination, starting from 1. Defaults to the first page.
   * @param {string} [expand=''] - A comma-separated list of related entities to include (expand) in the response. Optional.
   * @param {FilterIndex<TDto>[]} [filters] - An array of filters to apply to the query, each consisting of a property, operator, and value. Optional.
   * @param {number} [perPage=100] - The number of items to retrieve per page. Defaults to 100 items.
   * @param {string} [sort=''] - A string specifying the sort order of the results (e.g., '-created_at' for descending order). Optional.
   *
   * @returns {Observable<IndexResponse<TDomain>>} - An observable that emits the transformed and paginated response containing domain model entities.
   *
   * @throws {any} - Throws an error if the HTTP request fails or if the response is not marked as "ok".
   *
   * @author Hamed Arghavan
   *
   */
  fetchEntities<TDto, TDomain>(
    endpoint: string,
    dtoToDomainMapper: (dto: TDto) => TDomain,
    pageIndex: number = 1,
    expand: string = '',
    filters?: FilterIndex<TDto>[],
    perPage: number = 100,
    sort: string = ''
  ): Observable<IndexResponse<TDomain>> {
    let params = new HttpParams()
      .set('page', pageIndex)
      .set('per-page', perPage);

    if (expand) {
      params = params.append('expand', expand);
    }

    if (sort) {
      params = params.append('sort', sort);
    }

    if (filters && filters.length > 0) {
      for (const filter of filters) {
        params = params.append(`filter[${filter.prop as string}][${filter.operator}]`, `${filter.value}`);
      }
    }

    return this.http.get<ServerResponse<IndexResponse<TDto>>>(`${environment.apiUrl}/${endpoint}`, {params})
      .pipe(
        map(res => {
          if (res.ok) {
            return dtoConvertor(res.result, (indexResponse) => {
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
}