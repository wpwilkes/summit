import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  StatusBar,
} from 'expo-status-bar';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import PostDiscussion from '../components/posts/PostDiscussion';
import PostEditor from '../components/posts/PostEditor';
import PostIcon from '../components/posts/PostIcon';
import PostsHeader from '../components/posts/PostsHeader';
import PostsSidebar from '../components/posts/PostsSidebar';
import SummitPostCard from '../components/posts/SummitPostCard';

import {
  colors,
  ui,
} from '../components/posts/postsTheme';

import {
  getRecentCommunities,
  type RecentCommunity,
} from '../services/recentCommunitiesService';

import {
  createBackendSummitPostsService,
  type BackendSummitPostsService,
} from '../services/backendSummitPostsService';

import {
  getPostsProfile,
} from '../services/summitProfileService';

type Props = {
  onLogout: () => void;

  loggingOut: boolean;

  logoutError: string;

  onPopularPress: () => void;

  onNewsPress: () => void;

  onSearchPress: () => void;

  onDiscoverCommunitiesPress: () => void;

  onStartCommunityPress: () => void;

  onRecentCommunityPress: (
    community: RecentCommunity,
  ) => void;
};

type EditorState = {
  id?: string;

  returnTo:
    | 'feed'
    | 'discussion';
} | null;

export default function SummitPostsScreen({
  onLogout,
  loggingOut,
  logoutError,
  onPopularPress,
  onNewsPress,
  onSearchPress,
  onDiscoverCommunitiesPress,
  onStartCommunityPress,
  onRecentCommunityPress,
}: Props) {
  const [
    service,
    setService,
  ] =
    useState<BackendSummitPostsService | null>(
      null,
    );

  const [
    profileError,
    setProfileError,
  ] = useState('');

  const [
    retry,
    setRetry,
  ] = useState(0);

  const [busy, setBusy] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const [
    revision,
    setRevision,
  ] = useState(0);

  const [
    selectedId,
    setSelectedId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    editor,
    setEditor,
  ] =
    useState<EditorState>(
      null,
    );

  const [
    sidebar,
    setSidebar,
  ] = useState(false);

  const [
    recentCommunities,
    setRecentCommunities,
  ] =
    useState<
      RecentCommunity[]
    >([]);

  const [
    error,
    setError,
  ] = useState('');

  const refresh = () =>
    setRevision(
      (value) =>
        value + 1,
    );

  useEffect(() => {
    let active = true;

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        12000,
      );

    getPostsProfile(controller.signal)
      .then(async (profile) => {
        const backendService = createBackendSummitPostsService(profile);
        await backendService.load();
        if (active) {
          setService(backendService);
          setProfileError('');
        }
      })
      .catch(
        (cause) => {
          if (active) {
            setProfileError(
              controller.signal
                .aborted
                ? 'Could not reach the server. Check your connection and try again.'
                : cause instanceof Error
                  ? cause.message
                  : 'Could not load your profile. Please try again.',
            );
          }
        },
      )
      .finally(() => {
        clearTimeout(
          timeout,
        );
      });

    return () => {
      active = false;

      clearTimeout(
        timeout,
      );

      controller.abort();
    };
  }, [retry]);

  useEffect(() => {
    if (
      Platform.OS ===
      'web'
    ) {
      return;
    }

    const listener =
      BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (editor) {
            setEditor(null);

            return true;
          }

          if (
            selectedId
          ) {
            setSelectedId(
              null,
            );

            return true;
          }

          return false;
        },
      );

    return () => {
      listener.remove();
    };
  }, [
    editor,
    selectedId,
  ]);

  const openSidebar = () => {
    setSidebar(true);

    getRecentCommunities()
      .then(
        (
          communities,
        ) => {
          setRecentCommunities(
            communities,
          );
        },
      )
      .catch(() => {
        setRecentCommunities(
          [],
        );
      });
  };

  const loadFeed = async (current = service) => {
    if (!current || loggingOut) return;
    setLoadingFeed(true);
    try {
      await current.load();
      if (selectedId) await current.loadComments(selectedId);
      refresh();
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not refresh posts.');
    } finally {
      setLoadingFeed(false);
    }
  };

  // Reload when opening a discussion; other users may have replied since the last visit.
  useEffect(() => {
    if (!service || !selectedId) return;
    let current = true;
    service.loadComments(selectedId)
      .then(() => { if (current) refresh(); })
      .catch((cause) => { if (current) setError(cause instanceof Error ? cause.message : 'Unable to load comments.'); });
    return () => { current = false; };
  }, [service, selectedId]);

  // Poll while this screen is mounted so users on other devices see new posts.
  useEffect(() => {
    if (!service) return;
    const interval = setInterval(() => {
      Promise.all([service.load(), ...(selectedId ? [service.loadComments(selectedId)] : [])])
        .then(() => refresh())
        .catch(() => { /* Keep last successful feed visible during transient outages. */ });
    }, 15000);
    return () => clearInterval(interval);
  }, [service, selectedId]);

  const act = async (action: () => Promise<void>) => {
    if (loggingOut || busy) return;
    setBusy(true);
    try {
      await action();
      refresh();
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const deletePost = (id: string) => act(async () => {
    if (!service) return;
    await service.remove(id);
    setSelectedId(null);
    setEditor(null);
  });

  const selectedPost = service && selectedId ? service.get(selectedId) : null;

  return (
    <SafeAreaView
      style={ui.page}
    >
      <StatusBar
        style="dark"
      />

      {!!logoutError && (
        <Text
          accessibilityRole="alert"
          style={[
            ui.error,
            styles.error,
          ]}
        >
          {logoutError}
        </Text>
      )}

      {!!error && (
        <Text
          accessibilityRole="alert"
          style={[
            ui.error,
            styles.error,
          ]}
        >
          {error}
        </Text>
      )}

      {editor &&
      service ? (
        <PostEditor
          key={
            editor.id ??
            'new'
          }
          initialValue={editor.id ? service.get(editor.id) : undefined}
          disabled={
            loggingOut
          }
          onCancel={() =>
            setEditor(
              null,
            )
          }
          onSubmit={async (input) => {
            if (editor.id) {
              await service.update(editor.id, input);
            } else {
              await service.create(input);
            }

            if (
              editor.returnTo ===
              'feed'
            ) {
              setSelectedId(
                null,
              );
            }

            setEditor(
              null,
            );

            setError('');

            refresh();
          }}
        />
      ) : selectedPost &&
        service ? (
        <PostDiscussion
          post={
            selectedPost
          }
          service={
            service
          }
          disabled={
            loggingOut
          }
          onChange={refresh}
          onClose={() =>
            setSelectedId(
              null,
            )
          }
          onEditPost={() =>
            setEditor({
              id:
                selectedPost.id,

              returnTo:
                'discussion',
            })
          }
          onDeletePost={() =>
            deletePost(
              selectedPost.id,
            )
          }
        />
      ) : (
        <>
          <PostsHeader
            onMenu={
              openSidebar
            }
            onSearch={
              onSearchPress
            }
            onCreate={() => {
              setEditor({
                returnTo:
                  'feed',
              });
            }}
            disabled={
              loggingOut ||
              !service
            }
          />

          {!service ? (
            <View
              style={
                styles.empty
              }
            >
              {profileError ? (
                <>
                  <Text
                    accessibilityRole="alert"
                    style={[
                      ui.error,
                      styles.center,
                    ]}
                  >
                    {
                      profileError
                    }
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setProfileError(
                        '',
                      );

                      setRetry(
                        (
                          value,
                        ) =>
                          value +
                          1,
                      );
                    }}
                    style={
                      ui.button
                    }
                  >
                    <Text
                      style={
                        ui.buttonText
                      }
                    >
                      Retry
                    </Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <ActivityIndicator
                    color={
                      colors.accent
                    }
                  />

                  <Text
                    style={
                      ui.muted
                    }
                  >
                    Loading your
                    profile…
                  </Text>
                </>
              )}
            </View>
          ) : (
            <FlatList
              refreshing={loadingFeed}
              onRefresh={() => { void loadFeed(); }}
              data={
                service.list()
              }
              extraData={
                revision
              }
              keyExtractor={(
                post,
              ) =>
                post.id
              }
              contentContainerStyle={[
                ui.constrained,
                styles.list,
              ]}
              ItemSeparatorComponent={
                PostSeparator
              }
              ListEmptyComponent={
                <View
                  style={
                    styles.empty
                  }
                >
                  <PostIcon
                    name="comment"
                    size={42}
                    color={
                      colors.muted
                    }
                  />

                  <Text
                    style={
                      ui.title
                    }
                  >
                    Start the
                    conversation
                  </Text>

                  <Text
                    style={
                      ui.muted
                    }
                  >
                    Tap + to
                    share a
                    message or
                    a photo.
                  </Text>
                </View>
              }
              renderItem={({
                item,
              }) => (
                <SummitPostCard
                  post={
                    item
                  }
                  disabled={
                    loggingOut || busy
                  }
                  onOpen={() =>
                    setSelectedId(
                      item.id,
                    )
                  }
                  onEdit={() =>
                    setEditor({
                      id:
                        item.id,

                      returnTo:
                        'feed',
                    })
                  }
                  onDelete={() =>
                    deletePost(
                      item.id,
                    )
                  }
                  onVote={(
                    value,
                  ) =>
                    act(async () => {
                      await service.vote(item.id, value);
                    })
                  }
                />
              )}
            />
          )}
        </>
      )}

      <PostsSidebar
        visible={
          sidebar
        }
        onClose={() =>
          setSidebar(
            false,
          )
        }
        loggingOut={
          loggingOut
        }
        onLogout={
          onLogout
        }
        recentCommunities={
          recentCommunities
        }
        onPopularPress={() => {
          setSidebar(
            false,
          );

          setSelectedId(
            null,
          );

          setEditor(null);

          onPopularPress();
        }}
        onNewsPress={() => {
          setSidebar(
            false,
          );

          setSelectedId(
            null,
          );

          setEditor(null);

          onNewsPress();
        }}
        onDiscoverCommunitiesPress={() => {
          setSidebar(
            false,
          );

          setSelectedId(
            null,
          );

          setEditor(null);

          onDiscoverCommunitiesPress();
        }}
        onStartCommunityPress={() => {
          setSidebar(
            false,
          );

          setSelectedId(
            null,
          );

          setEditor(null);

          onStartCommunityPress();
        }}
        onRecentCommunityPress={(
          community,
        ) => {
          setSidebar(
            false,
          );

          setSelectedId(
            null,
          );

          setEditor(null);

          onRecentCommunityPress(
            community,
          );
        }}
      />
    </SafeAreaView>
  );
}

function PostSeparator() {
  return (
    <View
      style={
        ui.separator
      }
    />
  );
}

const styles =
  StyleSheet.create({
    list: {
      flexGrow: 1,
      paddingBottom:
        28,
    },

    empty: {
      flex: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 12,
      padding: 28,
      minHeight:
        280,
    },

    error: {
      paddingHorizontal:
        16,
      paddingVertical:
        8,
    },

    center: {
      textAlign:
        'center',
    },
  });