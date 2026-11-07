import {
  type ComponentRef,
  useRef,
  useState,
} from 'react';

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

import type {
  BackendSummitPostsService,
} from '../../services/backendSummitPostsService';

import type {
  SummitComment,
  SummitPost,
} from '../../types/summitPost.types';

import ItemActionsMenu from './ItemActionsMenu';
import AnonymousOption from './AnonymousOption';
import PostIcon from './PostIcon';
import PostSummary from './PostSummary';
import SummitPostCard from './SummitPostCard';
import UserAvatar from './UserAvatar';
import VoteControls from './VoteControls';

import {
  colors,
  relativeTime,
  ui,
} from './postsTheme';

type Props = {
  post: SummitPost;

  service:
    BackendSummitPostsService;

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
  const [
    body,
    setBody,
  ] =
    useState('');

  const [
    isAnonymous,
    setIsAnonymous,
  ] =
    useState(false);

  const [
    editingId,
    setEditingId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    replyingToId,
    setReplyingToId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    replyingToName,
    setReplyingToName,
  ] =
    useState('');

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const input =
    useRef<
      ComponentRef<
        typeof TextInput
      >
    >(null);

  const comments =
    service.comments(
      post.id,
    );

  const activeCommentIds =
    new Set(
      comments.map(
        (comment) =>
          comment.id,
      ),
    );

  /*
   * A comment is a root comment when
   * it does not have a parent.
   *
   * If the parent was deleted and is
   * no longer shown, we also display
   * the surviving reply at root level
   * rather than hiding it completely.
   */
  const rootComments =
    comments.filter(
      (comment) =>
        !comment.parentId ||
        !activeCommentIds.has(
          comment.parentId,
        ),
    );

  const displayNameFor =
    (
      comment: SummitComment,
    ) =>
      comment.isAnonymous
        ? 'Anonymous'
        : (
            typeof comment.author ===
            'string'
              ? comment.author
              : ''
          ).replace(
            /^u\//i,
            '',
          ) ||
          'Unknown user';

  const repliesFor =
    (commentId: string) =>
      comments.filter(
        (comment) =>
          comment.parentId ===
          commentId,
      );

  const act =
    async (
      action:
        () => Promise<void>,
    ) => {
      if (
        disabled ||
        busy
      ) {
        return;
      }

      setBusy(true);

      try {
        await action();

        setError('');

        onChange();
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Please try again.',
        );
      } finally {
        setBusy(false);
      }
    };

  const resetComposer =
    () => {
      setEditingId(null);

      setReplyingToId(null);

      setReplyingToName('');

      setBody('');

      setIsAnonymous(
        false,
      );

      setError('');
    };

  const submitComment =
    () =>
      act(
        async () => {
          if (
            editingId
          ) {
            await service.updateComment(
              post.id,
              editingId,
              body,
              isAnonymous,
            );
          } else if (
            replyingToId
          ) {
            await service.reply(
              post.id,
              replyingToId,
              body,
              isAnonymous,
            );
          } else {
            await service.comment(
              post.id,
              body,
              isAnonymous,
            );
          }

          resetComposer();

          Keyboard.dismiss();
        },
      );

  const editComment =
    (
      comment:
        SummitComment,
    ) => {
      setReplyingToId(
        null,
      );

      setReplyingToName(
        '',
      );

      setEditingId(
        comment.id,
      );

      setBody(
        comment.body,
      );

      setIsAnonymous(
        comment.isAnonymous ===
          true,
      );

      setError('');

      input.current?.focus();
    };

  const replyToComment =
    (
      comment:
        SummitComment,
    ) => {
      setEditingId(
        null,
      );

      setReplyingToId(
        comment.id,
      );

      setReplyingToName(
        displayNameFor(
          comment,
        ),
      );

      setBody('');

      setIsAnonymous(
        false,
      );

      setError('');

      input.current?.focus();
    };

  const renderComment =
    (
      item:
        SummitComment,

      depth = 0,
    ) => {
      const displayName =
        displayNameFor(
          item,
        );

      const replies =
        repliesFor(
          item.id,
        );

      return (
        <View
          key={item.id}
          style={[
            styles.commentThread,

            depth > 0 &&
              styles.replyThread,
          ]}
        >
          <View
            style={
              styles.comment
            }
          >
            <View
              style={ui.row}
            >
              <UserAvatar
                username={
                  displayName
                }
                size={31}
              />

              <Text
                style={
                  styles.username
                }
              >
                {displayName}
              </Text>

              <Text
                style={ui.muted}
              >
                {' '}
                ·{' '}
                {relativeTime(
                  item.createdAt,
                )}

                {item.updatedAt !==
                item.createdAt
                  ? ' · edited'
                  : ''}
              </Text>
            </View>

            <Text
              selectable
              style={
                styles.commentBody
              }
            >
              {item.body}
            </Text>

            <View
              style={
                styles.commentActions
              }
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Reply to ${displayName}`}
                disabled={
                  disabled ||
                  busy
                }
                onPress={() =>
                  replyToComment(
                    item,
                  )
                }
                style={
                  styles.replyButton
                }
              >
                <Text
                  style={
                    styles.replyButtonText
                  }
                >
                  Reply
                </Text>
              </Pressable>

              <View
                style={ui.flex}
              />

              {item.isOwner && (
                <ItemActionsMenu
                  subject="comment"
                  disabled={
                    disabled ||
                    busy
                  }
                  onEdit={() =>
                    editComment(
                      item,
                    )
                  }
                  onDelete={() =>
                    act(
                      async () => {
                        await service.removeComment(
                          post.id,
                          item.id,
                        );

                        if (
                          editingId ===
                          item.id
                        ) {
                          resetComposer();
                        }

                        if (
                          replyingToId ===
                          item.id
                        ) {
                          resetComposer();
                        }
                      },
                    )
                  }
                />
              )}

              <VoteControls
                subject="comment"
                compact
                count={
                  item.voteCount
                }
                vote={
                  item.userVote
                }
                disabled={
                  disabled ||
                  busy
                }
                onVote={(
                  value,
                ) =>
                  act(
                    async () => {
                      await service.voteComment(
                        post.id,
                        item.id,
                        value,
                      );
                    },
                  )
                }
              />
            </View>
          </View>

          {replies.map(
            (reply) =>
              renderComment(
                reply,
                depth + 1,
              ),
          )}
        </View>
      );
    };

  return (
    <KeyboardAvoidingView
      style={ui.flex}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >
      <View
        style={[
          ui.constrained,
          styles.header,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close discussion"
          onPress={
            onClose
          }
          style={ui.iconButton}
        >
          <PostIcon
            name="close"
          />
        </Pressable>

        <Text
          style={
            styles.community
          }
        >
          s/{post.community}
        </Text>
      </View>

      <FlatList
        data={
          rootComments
        }
        keyExtractor={(
          comment,
        ) =>
          comment.id
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          ui.constrained,
          styles.list,
        ]}
        extraData={
          post
        }
        ListHeaderComponent={
          <>
            <SummitPostCard
              post={post}
              onEdit={
                onEditPost
              }
              onDelete={
                onDeletePost
              }
              onVote={(
                value,
              ) =>
                act(
                  async () => {
                    await service.vote(
                      post.id,
                      value,
                    );
                  },
                )
              }
              disabled={
                disabled ||
                busy
              }
            />

            <PostSummary
              postId={
                post.id
              }
              commentCount={
                post.commentCount
              }
              service={
                service
              }
              disabled={
                disabled ||
                busy
              }
            />

            <Text
              style={
                styles.commentsHeading
              }
            >
              Comments ·{' '}
              {post.commentCount}
            </Text>
          </>
        }
        ListEmptyComponent={
          <Text
            style={
              styles.empty
            }
          >
            Be the first to
            join the
            conversation.
          </Text>
        }
        renderItem={({
          item,
        }) =>
          renderComment(
            item,
          )
        }
      />

      <View
        style={[
          ui.constrained,
          styles.bottom,
        ]}
      >
        {!!error && (
          <Text
            accessibilityRole="alert"
            style={ui.error}
          >
            {error}
          </Text>
        )}

        {!!editingId && (
          <View
            style={
              ui.between
            }
          >
            <Text
              style={
                ui.muted
              }
            >
              Editing comment
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel comment edit"
              onPress={
                resetComposer
              }
              style={
                styles.cancel
              }
            >
              <Text
                style={
                  ui.label
                }
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        )}

        {!!replyingToId &&
          !editingId && (
            <View
              style={
                ui.between
              }
            >
              <Text
                numberOfLines={
                  1
                }
                style={[
                  ui.muted,
                  styles.replyingText,
                ]}
              >
                Replying to{' '}
                {replyingToName}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel reply"
                onPress={
                  resetComposer
                }
                style={
                  styles.cancel
                }
              >
                <Text
                  style={
                    ui.label
                  }
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          )}

        <AnonymousOption
          value={
            isAnonymous
          }
          onChange={
            setIsAnonymous
          }
          disabled={
            disabled ||
            busy
          }
        />

        <View
          style={
            styles.composer
          }
        >
          <TextInput
            ref={input}
            accessibilityLabel={
              editingId
                ? 'Edit comment text'
                : replyingToId
                  ? 'Reply text'
                  : 'Comment text'
            }
            placeholder={
              editingId
                ? 'Edit comment'
                : replyingToId
                  ? `Reply to ${replyingToName}`
                  : 'Join the conversation'
            }
            placeholderTextColor={
              colors.muted
            }
            style={
              styles.input
            }
            value={body}
            onChangeText={(
              value,
            ) => {
              setBody(
                value,
              );

              setError('');
            }}
            maxLength={
              2000
            }
            multiline
            editable={
              !disabled &&
              !busy
            }
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              editingId
                ? 'Save comment'
                : replyingToId
                  ? 'Submit reply'
                  : 'Submit comment'
            }
            accessibilityState={{
              disabled:
                disabled ||
                busy ||
                !body.trim(),
            }}
            disabled={
              disabled ||
              busy ||
              !body.trim()
            }
            onPress={
              submitComment
            }
            style={[
              styles.send,

              (!body.trim() ||
                disabled) &&
                styles.sendDisabled,
            ]}
          >
            <PostIcon
              name="send"
              color={
                body.trim()
                  ? '#fff'
                  : colors.muted
              }
              size={23}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles =
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    community: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      backgroundColor:
        colors.soft,
      paddingVertical: 12,
      paddingHorizontal: 17,
      borderRadius: 24,
    },

    list: {
      paddingBottom: 24,
    },

    commentsHeading: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 15,
      padding: 18,
      borderTopWidth: 5,
      borderTopColor:
        colors.soft,
      marginTop: 8,
    },

    empty: {
      padding: 24,
      color: colors.muted,
      fontSize: 15,
      textAlign: 'center',
    },

    commentThread: {
      backgroundColor:
        colors.surface,
    },

    replyThread: {
      marginLeft: 18,
      borderLeftWidth: 2,
      borderLeftColor:
        colors.border,
    },

    comment: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 5,
    },

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
      minHeight: 44,
    },

    replyButton: {
      minHeight: 44,
      justifyContent:
        'center',
      paddingHorizontal: 4,
      paddingRight: 12,
    },

    replyButtonText: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '600',
    },

    bottom: {
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 6,
      backgroundColor:
        colors.surface,
    },

    replyingText: {
      flex: 1,
      paddingRight: 8,
    },

    composer: {
      flexDirection: 'row',
      alignItems:
        'flex-end',
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 28,
      padding: 5,
      paddingLeft: 17,
      gap: 8,
      backgroundColor:
        '#fbfbfb',
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
      backgroundColor:
        colors.accent,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    sendDisabled: {
      backgroundColor:
        colors.soft,
    },

    cancel: {
      minHeight: 44,
      justifyContent:
        'center',
      paddingHorizontal: 12,
    },
  });
