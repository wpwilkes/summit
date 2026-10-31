import type { Community } from '@summit/shared';
import { createCommunity } from './communities.repositories.js';

export type DatabaseCommunity = NonNullable<
  Awaited<ReturnType<typeof createCommunity>>
>;

export function toCommunityContract(community: DatabaseCommunity): Community {
  return {
    id: community.id,
    name: community.name,
    description: community.description,
    creatorId: community.creatorId,
    createdAt: community.createdAt.toISOString(),
  };
}
