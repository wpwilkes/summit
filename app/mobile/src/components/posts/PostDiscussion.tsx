import { useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { SummitPostsService } from '../../services/summitPostsService';
import type { SummitComment, SummitPost } from '../../types/summitPost.types';
import ItemActionsMenu from './ItemActionsMenu';
import PostIcon from './PostIcon';
import SummitPostCard from './SummitPostCard';
import UserAvatar from './UserAvatar';
import VoteControls from './VoteControls';
import { colors, relativeTime, ui } from './postsTheme';

type Props = {
  post: SummitPost;
  service: SummitPostsService;
  disabled?: boolean;
  onChange: () => void;
  onClose: () => void;
  onEditPost: () => void;
  onDeletePost: () => void;
};

export default function PostDiscussion({
  post,
  service,
  disabled = false,
  onChange,
  onClose,
  onEditPost,
  onDeletePost,
}: Props) {
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const input = useRef<TextInput>(null);
  const comments = service.comments(post.id);

  const act = (action: () => void) => {
    if (disabled) return;
    try {
      action();
      setError('');
      onChange();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try again.');
    }
  };
  const cancelEdit = () => {
    setEditingId(null);
    setBody('');
    setError('');
  };
  const submitComment = () =>
    act(() => {
      if (editingId) service.updateComment(post.id, editingId, body);
      else service.comment(post.id, body);
      cancelEdit();
      Keyboard.dismiss();
    });
  const editComment = (comment: SummitComment) => {
    setEditingId(comment.id);
    setBody(comment.body);
    setError('');
    input.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      style={ui.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[ui.constrained, styles.header]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close discussion"
          onPress={onClose}
          style={ui.iconButton}
        >
          <PostIcon name="close" />
        </Pressable>
        <Text style={styles.community}>s/{post.community}</Text>
      </View>
      <FlatList
        data={comments}
        keyExtractor={(comment) => comment.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[ui.constrained, styles.list]}
        extraData={post}
        ListHeaderComponent={
          <>
            <SummitPostCard
              post={post}
              onEdit={onEditPost}
              onDelete={onDeletePost}
              onVote={(value) =>
                act(() => {
                  service.vote(post.id, value);
                })
              }
              disabled={disabled}
            />
            <Text style={styles.commentsHeading}>
              Comments · {post.commentCount}
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            Be the first to join the conversation.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <View style={ui.row}>
              <UserAvatar username={item.author} size={31} />
              <Text style={styles.username}>
                {item.author.replace(/^u\//i, '')}
              </Text>
              <Text style={ui.muted}>
                · {relativeTime(item.createdAt)}
                {item.updatedAt !== item.createdAt ? ' · edited' : ''}
              </Text>
            </View>
            <Text selectable style={styles.commentBody}>
              {item.body}
            </Text>
            <View style={styles.commentActions}>
              {item.isOwner && (
                <ItemActionsMenu
                  subject="comment"
                  disabled={disabled}
                  onEdit={() => editComment(item)}
                  onDelete={() =>
                    act(() => {
                      service.removeComment(post.id, item.id);
                      if (editingId === item.id) cancelEdit();
                    })
                  }
                />
              )}
              <VoteControls
                subject="comment"
                compact
                count={item.voteCount}
                vote={item.userVote}
                disabled={disabled}
                onVote={(value) =>
                  act(() => {
                    service.voteComment(post.id, item.id, value);
                  })
                }
              />
            </View>
          </View>
        )}
      />
      <View style={[ui.constrained, styles.bottom]}>
        {!!error && (
          <Text accessibilityRole="alert" style={ui.error}>
            {error}
          </Text>
        )}
        {!!editingId && (
          <View style={ui.between}>
            <Text style={ui.muted}>Editing comment</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel comment edit"
              onPress={cancelEdit}
              style={styles.cancel}
            >
              <Text style={ui.label}>Cancel</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.composer}>
          <TextInput
            ref={input}
            accessibilityLabel={
              editingId ? 'Edit comment text' : 'Comment text'
            }
            placeholder="Join the conversation"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={body}
            onChangeText={(value) => {
              setBody(value);
              setError('');
            }}
            maxLength={2000}
            multiline
            editable={!disabled}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={editingId ? 'Save comment' : 'Submit comment'}
            accessibilityState={{ disabled: disabled || !body.trim() }}
            disabled={disabled || !body.trim()}
            onPress={submitComment}
            style={[
              styles.send,
              (!body.trim() || disabled) && styles.sendDisabled,
            ]}
          >
            <PostIcon
              name="send"
              color={body.trim() ? '#fff' : colors.muted}
              size={23}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  community: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    backgroundColor: colors.soft,
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 24,
  },
  list: { paddingBottom: 24 },
  commentsHeading: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
    padding: 18,
    borderTopWidth: 5,
    borderTopColor: colors.soft,
    marginTop: 8,
  },
  empty: {
    padding: 24,
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  comment: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 5 },
  username: {
    color: colors.muted,
    fontWeight: '600',
    fontSize: 13,
    flexShrink: 1,
  },
  commentBody: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 10,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: colors.surface,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 5,
    paddingLeft: 17,
    gap: 8,
    backgroundColor: '#fbfbfb',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
    paddingTop: 10,
    paddingBottom: 10,
    outlineWidth: 0,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: colors.soft },
  cancel: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
});
