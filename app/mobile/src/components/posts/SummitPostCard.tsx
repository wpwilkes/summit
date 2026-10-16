import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SummitPost } from '../../types/summitPost.types';
import { colors, ui } from './postsTheme';

type Props = {
  post: SummitPost;
  onOpen: () => void;
  onEdit: () => void;
  onVote: (value: -1 | 1) => void;
  disabled: boolean;
};

export default function SummitPostCard({ post, onOpen, onEdit, onVote, disabled }: Props) {
  return (
    <View style={ui.card}>
      <View style={ui.row}>
        <Text style={styles.category}>{post.category}</Text>
        <Text style={ui.muted}>Posted by {post.author}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open post: ${post.title}`} onPress={onOpen} disabled={disabled}>
        <Text style={ui.title}>{post.title}</Text>
      </Pressable>
      <Text style={ui.body} numberOfLines={4}>{post.description}</Text>
      <View style={ui.row}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Upvote ${post.title}`}
          accessibilityState={{ selected: post.userVote === 1, disabled }} disabled={disabled}
          onPress={() => onVote(1)} style={[styles.vote, post.userVote === 1 && styles.voted]}>
          <Text style={ui.secondaryText}>▲</Text>
        </Pressable>
        <Text accessibilityLabel={`${post.voteCount} votes`} style={ui.label}>{post.voteCount}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Downvote ${post.title}`}
          accessibilityState={{ selected: post.userVote === -1, disabled }} disabled={disabled}
          onPress={() => onVote(-1)} style={[styles.vote, post.userVote === -1 && styles.voted]}>
          <Text style={ui.secondaryText}>▼</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onOpen} disabled={disabled} style={styles.action}>
          <Text style={ui.secondaryText}>{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}</Text>
        </Pressable>
        {post.isOwner && <Pressable accessibilityRole="button" onPress={onEdit} disabled={disabled} style={styles.action}>
          <Text style={ui.secondaryText}>Edit</Text>
        </Pressable>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  category: { color: colors.accent, backgroundColor: colors.accentSurface, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 5, fontSize: 12, fontWeight: '600' },
  vote: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: colors.border },
  voted: { backgroundColor: colors.accentSurface, borderColor: colors.accent },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 },
});
