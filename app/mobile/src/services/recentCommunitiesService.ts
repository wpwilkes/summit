import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_COMMUNITIES_KEY =
  'summit_recent_communities';

const MAX_RECENT_COMMUNITIES = 5;

export type RecentCommunity = {
  id: string;
  name: string;
  visitedAt: string;
};

export async function getRecentCommunities(): Promise<
  RecentCommunity[]
> {
  try {
    const stored = await AsyncStorage.getItem(
      RECENT_COMMUNITIES_KEY,
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (
          community,
        ): community is RecentCommunity =>
          typeof community?.id === 'string' &&
          typeof community?.name === 'string' &&
          typeof community?.visitedAt === 'string',
      )
      .slice(0, MAX_RECENT_COMMUNITIES);
  } catch {
    return [];
  }
}

export async function recordRecentCommunity(
  community: {
    id: string;
    name: string;
  },
): Promise<RecentCommunity[]> {
  const current =
    await getRecentCommunities();

  const updatedCommunity: RecentCommunity = {
    id: community.id,
    name: community.name,
    visitedAt: new Date().toISOString(),
  };

  const next = [
    updatedCommunity,
    ...current.filter(
      (item) =>
        item.id !== community.id,
    ),
  ].slice(0, MAX_RECENT_COMMUNITIES);

  await AsyncStorage.setItem(
    RECENT_COMMUNITIES_KEY,
    JSON.stringify(next),
  );

  return next;
}