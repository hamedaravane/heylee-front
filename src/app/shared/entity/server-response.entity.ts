export interface ServerResponse<T> {
  ok: boolean;
  result: T;
}

export function dtoConvertor<T, U>(data: T, convertor: (data: T) => U): U {
  return convertor(data);
}
