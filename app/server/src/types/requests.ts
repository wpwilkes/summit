import type { Request } from 'express';

export type BodyRequest<B> = Request<Record<string, never>, unknown, B>;
export type ParamsRequest<P> = Request<
  P & Record<string, string>,
  unknown,
  unknown
>;
export type ParamsBodyRequest<P, B> = Request<
  P & Record<string, string>,
  unknown,
  B
>;
