import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Post } from '../types/post.types';

type Props = {
  post: Post;
};

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return count.toString();
}

function getToneColor(
  tone: Post['summaryTone']
): string {
  switch (tone) {
    case 'Broad consensus':
      return '#20d99a';

    case 'Divided opinions':
      return '#f0b91c';

    case 'Informative thread':
      return '#25b9ef';

    case 'Light-hearted':
      return '#a875ff';

    default:
      return '#e7c86e';
  }
}

export default function PostCard({
  post,
}: Props) {
  const [showSummary, setShowSummary] =
    useState(false);

  const toneColor = getToneColor(
    post.summaryTone
  );

  return (
    <View style={styles.card}>
      {/* Community and Post Information */}

      <View style={styles.metaSection}>
        <View style={styles.communityRow}>
          <Text style={styles.community}>
            r/{post.community}
          </Text>

          <Text style={styles.dot}>
            ·
          </Text>

          <Text style={styles.timeText}>
            {post.timeAgo}
          </Text>
        </View>

        <Text style={styles.authorText}>
          Posted by u/{post.author}
        </Text>
      </View>

      {/* Post Title */}

      <Text style={styles.title}>
        {post.title}
      </Text>

      {/* Category */}

      <View style={styles.categoryRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {post.category}
          </Text>
        </View>
      </View>

      {/* Description */}

      <Text style={styles.description}>
        {post.description}
      </Text>

      {/* Tags */}

      <View style={styles.tagRow}>
        {post.tags.map((tag) => (
          <Text
            key={tag}
            style={styles.tagText}
          >
            #{tag}
          </Text>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Reply Digest */}

      <View style={styles.summaryHeader}>
        <View style={styles.toneContainer}>
          <Text
            style={[
              styles.toneDot,
              {
                color: toneColor,
              },
            ]}
          >
            ●
          </Text>

          <Text
            style={[
              styles.summaryTone,
              {
                color: toneColor,
              },
            ]}
          >
            {post.summaryTone.toUpperCase()}
          </Text>
        </View>

        {post.aiSummary ? (
          <Pressable
            style={styles.summaryButton}
            onPress={() =>
              setShowSummary(
                (currentValue) =>
                  !currentValue
              )
            }
            accessibilityRole="button"
            accessibilityLabel={
              showSummary
                ? 'Hide reply digest'
                : 'Show reply digest'
            }
          >
            <Text
              style={styles.summaryButtonText}
            >
              Reply digest
            </Text>

            <Text
              style={styles.summaryArrow}
            >
              {showSummary ? '▲' : '▼'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* AI Summary */}

      {showSummary && post.aiSummary ? (
        <View
          style={[
            styles.summaryContainer,
            {
              borderLeftColor: toneColor,
            },
          ]}
        >
          <Text style={styles.summaryText}>
            {post.aiSummary}
          </Text>

          <Text style={styles.aiLabel}>
            AI-generated from{' '}
            {formatCount(post.replyCount)} replies
          </Text>
        </View>
      ) : null}

      {/* Bottom Actions */}

      <View style={styles.footer}>
        <View style={styles.voteArea}>
          <Text style={styles.voteArrow}>
            ▲
          </Text>

          <Text style={styles.voteCount}>
            {formatCount(post.voteCount)}
          </Text>

          <Text style={styles.voteArrow}>
            ▼
          </Text>
        </View>

        <Text style={styles.footerText}>
          {formatCount(post.replyCount)} replies
        </Text>

        <Text style={styles.footerText}>
          Share
        </Text>

        <Text style={styles.footerText}>
          Save
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#2b2b2f',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },

  metaSection: {
    marginBottom: 11,
  },

  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  community: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  dot: {
    color: '#666666',
    fontSize: 11,
    marginHorizontal: 6,
  },

  timeText: {
    color: '#777777',
    fontSize: 11,
  },

  authorText: {
    color: '#666666',
    fontSize: 10,
    marginTop: 3,
  },

  title: {
    color: '#ffffff',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
  },

  categoryRow: {
    flexDirection: 'row',
    marginTop: 9,
  },

  categoryBadge: {
    backgroundColor: '#29251a',
    borderRadius: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  categoryText: {
    color: '#e7c86e',
    fontSize: 10,
    fontWeight: '700',
  },

  description: {
    color: '#a0a0a0',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 11,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  tagText: {
    color: '#777777',
    fontSize: 11,
    marginRight: 10,
    marginBottom: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#29292d',
    marginTop: 12,
    marginBottom: 11,
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  toneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  toneDot: {
    fontSize: 11,
    marginRight: 6,
  },

  summaryTone: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    flexShrink: 1,
  },

  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingLeft: 8,
  },

  summaryButtonText: {
    color: '#aaaaaa',
    fontSize: 11,
    fontWeight: '500',
  },

  summaryArrow: {
    color: '#777777',
    fontSize: 9,
    marginLeft: 6,
  },

  summaryContainer: {
    borderLeftWidth: 2,
    paddingLeft: 11,
    marginTop: 13,
  },

  summaryText: {
    color: '#cccccc',
    fontSize: 13,
    lineHeight: 20,
  },

  aiLabel: {
    color: '#666666',
    fontSize: 10,
    marginTop: 8,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#29292d',
  },

  voteArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 17,
  },

  voteArrow: {
    color: '#888888',
    fontSize: 12,
  },

  voteCount: {
    color: '#bbbbbb',
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: 6,
  },

  footerText: {
    color: '#777777',
    fontSize: 11,
    marginRight: 17,
    paddingVertical: 3,
  },
});