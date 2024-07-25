import {HttpErrorResponse} from '@angular/common/http';

export interface ServerResponse<T> {
  ok: boolean;
  result: T;
}

interface ErrorResult {
  name: string,
  message: string,
  code: number,
  status: number
}

interface ValidationErrorResult {
  field: string,
  message: string
}

export class ServerResponseError {
  res!: ErrorResult;
  validationErrors!: ValidationErrorResult[];
  status: number;

  constructor(errorResponse: unknown) {
    const res = errorResponse as HttpErrorResponse;
    console.error(res);
    if (res.status !== 422) {
      this.res = res.error.result as ErrorResult;
      this.status = this.res.status;
    } else {
      this.validationErrors = res.error.result as ValidationErrorResult[];
      this.status = res.status;
    }
  }
}

export function dtoConvertor<T, U>(data: T, convertor: (data: T) => U): U {
  return convertor(data);
}

interface Links {
  self: Link;
  first: Link;
  last: Link;
}

interface Link {
  href: string;
}

interface Meta {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
}

export interface IndexResponse<T> {
  items: T[];
  _links: Links;
  _meta: Meta;
}
