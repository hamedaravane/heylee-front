export interface ServerResponse<T> {
  ok: boolean;
  result: T;
}

export interface ServerError extends Error {
  error: {
    ok: boolean;
    result: any;
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
