import { Prisma } from '../generated/prisma/client.js';
import { prismaClient } from '../lib/prisma.js';

// Never return more than this many results in one search.
const MAX_RESULTS = 50;

// Run a post search. Newest posts come first. Comments that were deleted are
// not counted.
function findPosts(where: Prisma.PostWhereInput) {
  return prismaClient.post.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: MAX_RESULTS,
    include: {
      author: { select: { username: true } },
      _count: { select: { comments: { where: { deletedAt: null } } } },
    },
  });
}

// Find posts whose title OR body contains the keyword (ignoring upper/lower
// case).
export async function searchPosts(keyword: string) {
  return findPosts({
    OR: [
      { title: { contains: keyword, mode: 'insensitive' } },
      { body: { contains: keyword, mode: 'insensitive' } },
    ],
  });
}

// Find posts where the term appears in the title, the body, or the text of a
// comment that has not been deleted (ignoring upper/lower case).
export async function searchPostsAndComments(term: string) {
  return findPosts({
    OR: [
      { title: { contains: term, mode: 'insensitive' } },
      { body: { contains: term, mode: 'insensitive' } },
      {
        comments: {
          some: {
            deletedAt: null,
            body: { contains: term, mode: 'insensitive' },
          },
        },
      },
    ],
  });
}
