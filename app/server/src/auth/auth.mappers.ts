import type { User } from '@summit/shared';
import { findByEmail } from './auth.repositories.js';

type DatabaseUser = NonNullable<Awaited<ReturnType<typeof findByEmail>>>;

export function toUserContract(user: DatabaseUser): User {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
  };
}
