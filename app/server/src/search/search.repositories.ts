import { prismaClient } from '../lib/prisma.js';

// Never return more than this many results in one search.
const MAX_RESULTS = 50;

// Find posts whose title OR body contains the keyword (ignoring upper/lower
// case). Newest posts come first. Comments that were deleted are not counted.
export async function searchPosts(keyword: string) {
  return prismaClient.post.findMany({
    where: {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { body: { contains: keyword, mode: 'insensitive' } },
      ],
    },
    orderBy: [{ createdAt: 'desc' }],
    take: MAX_RESULTS,
    include: {
      author: { select: { username: true } },
      _count: { select: { comments: { where: { deletedAt: null } } } },
    },
  });
}
