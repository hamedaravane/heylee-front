export interface ServerResponse<T> {
  ok: boolean;
  result: T;
}

export interface SuccessResponse<T> extends ServerResponse<T> {
  ok: true;
}

export interface ErrorResponse extends ServerResponse<ErrorReason[]> {
  ok: false;
}

export interface ErrorReason {
  field: string;
  message: string;
}
