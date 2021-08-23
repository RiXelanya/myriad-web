export interface ErrorResponse<T> {
  readonly message: string;
  readonly name: string;
  readonly statusCode: number;
  readonly data?: T;
}