import { z } from 'zod';

export const PingDatabaseRequestSchema = z.object({});
export type PingDatabaseRequest = z.infer<typeof PingDatabaseRequestSchema>;

export const PingDatabaseErrorResponseSchema = z.object({
  result: z.literal('database error'),
});
export type PingDatabaseErrorResponse = z.infer<
  typeof PingDatabaseErrorResponseSchema
>;

export const PingDatabaseSuccessResponseSchema = z.object({
  result: z.literal('database ok'),
  timestamp: z.iso.datetime(),
});
export type PingDatabaseSuccessResponse = z.infer<
  typeof PingDatabaseSuccessResponseSchema
>;

export const PingDatabaseResponseSchema = z.union([
  PingDatabaseSuccessResponseSchema,
  PingDatabaseErrorResponseSchema,
]);
export type PingDatabaseResponse = z.infer<typeof PingDatabaseResponseSchema>;

export const PingServerRequestSchema = z.object({});
export type PingServerRequest = z.infer<typeof PingServerRequestSchema>;

export const PingServerErrorResponseSchema = z.object({
  result: z.literal('server error'),
});
export type PingServerErrorResponse = z.infer<
  typeof PingServerErrorResponseSchema
>;

export const PingServerSuccessResponseSchema = z.object({
  result: z.literal('server ok'),
  timestamp: z.iso.datetime(),
});
export type PingServerSuccessResponse = z.infer<
  typeof PingServerSuccessResponseSchema
>;

export const PingServerResponseSchema = z.union([
  PingServerSuccessResponseSchema,
  PingServerErrorResponseSchema,
]);
export type PingServerResponse = z.infer<typeof PingServerResponseSchema>;
