import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SummitPost } from '../../types/summitPost.types';
import ItemActionsMenu from './ItemActionsMenu';
import PostIcon from './PostIcon';
import UserAvatar from './UserAvatar';
import VoteControls from './VoteControls';
import { colors, formatCount, relativeTime, ui } from './postsTheme';

type Props = {
  post: SummitPost;
  onOpen?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onVote: (value: -1 | 1) => void;
  disabled?: boolean;
};

export default function SummitPostCard({
  post,
  onOpen,
  onEdit,
  onDelete,
  onVote,
  disabled = false,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <UserAvatar username={post.author} />
        <View style={styles.identity}>
          <View style={ui.row}>
            <Text numberOfLines={1} style={styles.community}>
              s/{post.community}
            </Text>
            <Text style={styles.time}>{relativeTime(post.createdAt)}</Text>
          </View>
          <Text numberOfLines={1} style={styles.username}>
            {(typeof post.author === 'string' ? post.author : '').replace(/^u\//i, '') || 'Unknown user'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Join s/${post.community}, display only`}
          accessibilityState={{ disabled: true }}
          disabled
          style={styles.join}
        >
          <Text style={styles.joinText}>Join</Text>
        </Pressable>
        {post.isOwner && (
          <ItemActionsMenu
            subject="post"
            onEdit={onEdit}
            onDelete={onDelete}
            disabled={disabled}
          />
        )}
      </View>
      <Pressable
        accessibilityRole={onOpen ? 'button' : undefined}
        accessibilityLabel={onOpen ? 'Open post discussion' : undefined}
        disabled={disabled || !onOpen}
        onPress={onOpen}
        style={styles.postContent}
      >
        {!!post.body && (
          <Text selectable={!onOpen} style={styles.body}>
            {post.body}
          </Text>
        )}
        {post.photo && (
          <Image
            accessibilityLabel={`Photo posted by ${post.author}`}
            source={{ uri: post.photo.uri }}
            resizeMode="contain"
            style={[
              styles.photo,
              {
                aspectRatio: Math.min(
                  1.8,
                  Math.max(0.65, (post.photo.width || 1) / (post.photo.height || 1)),
                ),
              },
            ]}
          />
        )}
      </Pressable>
      <View style={styles.actions}>
        <VoteControls
          count={post.voteCount}
          vote={post.userVote}
          onVote={onVote}
          disabled={disabled}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open comments, ${post.commentCount} comments`}
          accessibilityState={{ disabled: disabled || !onOpen }}
          disabled={disabled || !onOpen}
          onPress={onOpen}
          style={styles.comments}
        >
          <PostIcon name="comment" size={21} />
          <Text style={styles.count}>{formatCount(post.commentCount)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, paddingTop: 8, paddingBottom: 6 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 4,
    gap: 8,
    minHeight: 48,
  },
  identity: { flex: 1, minWidth: 0, gap: 2 },
  community: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  username: { color: colors.muted, fontSize: 12 },
  time: { color: colors.muted, fontSize: 12 },
  join: {
    backgroundColor: '#080a0b',
    paddingHorizontal: 15,
    minHeight: 30,
    borderRadius: 20,
    justifyContent: 'center',
  },
  joinText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  postContent: { paddingHorizontal: 16, gap: 8, paddingTop: 6 },
  body: { color: colors.text, fontSize: 18, fontWeight: '600', lineHeight: 24 },
  photo: {
    width: '100%',
    backgroundColor: colors.soft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  comments: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: 8,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
  },
  count: { fontWeight: '600', color: colors.text, fontSize: 14 },
});
