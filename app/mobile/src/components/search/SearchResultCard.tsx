import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SearchPostResult } from '@summit/shared';
import PostIcon from '../posts/PostIcon';
import UserAvatar from '../posts/UserAvatar';
import { colors, formatCount, relativeTime, ui } from '../posts/postsTheme';

type Props = {
  post: SearchPostResult;
  onPress?: () => void;
};

/** One search result: who posted, the title, a short preview, votes and comments. */
export default function SearchResultCard({ post, onPress }: Props) {
  const commentLabel = post.commentCount === 1 ? 'comment' : 'comments';
  const voteLabel = Math.abs(post.votes) === 1 ? 'vote' : 'votes';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Post: ${post.title}`}
      onPress={onPress}
      style={styles.card}
    >
      <View style={ui.row}>
        <UserAvatar username={post.authorUsername} size={24} />
        <Text numberOfLines={1} style={styles.author}>
          u/{post.authorUsername}
        </Text>
        <Text style={styles.time}>{relativeTime(post.createdAt)}</Text>
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {post.title}
      </Text>
      <Text numberOfLines={3} style={styles.preview}>
        {post.body}
      </Text>
      <View style={styles.footer}>
        <View style={styles.stat}>
          <PostIcon name="up" size={16} color={colors.muted} />
          <Text style={styles.statText}>
            {formatCount(post.votes)} {voteLabel}
          </Text>
        </View>
        <View style={styles.stat}>
          <PostIcon name="comment" size={16} color={colors.muted} />
          <Text style={styles.statText}>
            {formatCount(post.commentCount)} {commentLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  author: { flexShrink: 1, color: colors.text, fontSize: 13, fontWeight: '600' },
  time: { color: colors.muted, fontSize: 13 },
  title: { color: colors.text, fontSize: 17, fontWeight: '700', lineHeight: 23 },
  preview: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { color: colors.muted, fontSize: 13 },
});
