import type { Request } from 'express';

export type BodyRequest<T> = Request<Record<string, never>, unknown, T>;

export type ParamsRequest<P> = Request<P & Record<string, string>>;

export type ParamsBodyRequest<P, B> = Request<
  P & Record<string, string>,
  unknown,
  B
>;
