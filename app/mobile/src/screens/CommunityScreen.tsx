import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import type {
  Community,
  Post,
} from '@summit/shared';

import PostIcon from '../components/posts/PostIcon';

import {
  colors,
  ui,
} from '../components/posts/postsTheme';

import {
  getCommunity,
  getCommunityPosts,
  getJoinedCommunities,
  joinCommunity,
  leaveCommunity,
} from '../services/communityService';

import {
  recordRecentCommunity,
} from '../services/recentCommunitiesService';

import type {
  RootStackParamList,
} from '../types/navigation.types';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'Community'
  >;

export default function CommunityScreen({
  navigation,
  route,
}: Props) {
  const {
    communityId,
    communityName,
  } = route.params;

  const [
    community,
    setCommunity,
  ] = useState<Community | null>(
    null,
  );

  const [
    posts,
    setPosts,
  ] = useState<Post[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    joined,
    setJoined,
  ] = useState(false);

  const [
    joinErrorMessage,
    setJoinErrorMessage,
  ] = useState('');

  const [
    membershipLoading,
    setMembershipLoading,
  ] = useState(false);

  const displayName =
    community?.name ??
    communityName;

  const firstLetter =
    displayName
      .charAt(0)
      .toUpperCase();

  useEffect(() => {
    recordRecentCommunity({
      id: communityId,
      name: communityName,
    }).catch(() => {
      // Recently Visited is optional.
    });
  }, [
    communityId,
    communityName,
  ]);

  useEffect(() => {
    let active = true;

    const loadCommunity =
      async () => {
        setLoading(true);
        setErrorMessage('');
        setJoinErrorMessage('');

        const [
          communityResult,
          postsResult,
          joinedResult,
        ] = await Promise.all([
          getCommunity(
            communityName,
          ),

          getCommunityPosts(
            communityName,
          ),

          getJoinedCommunities(),
        ]);

        if (!active) {
          return;
        }

        if (
          !communityResult.success
        ) {
          setCommunity(null);
          setPosts([]);
          setJoined(false);

          setErrorMessage(
            communityResult.message,
          );

          setLoading(false);
          return;
        }

        setCommunity(
          communityResult.community,
        );

        if (
          postsResult.success
        ) {
          setPosts(
            postsResult.posts,
          );
        } else {
          setPosts([]);
        }

        if (
          joinedResult.success
        ) {
          const isJoined =
            joinedResult.communities.some(
              (item) =>
                item.id ===
                communityResult.community.id,
            );

          setJoined(
            isJoined,
          );
        } else {
          setJoined(false);

          setJoinErrorMessage(
            joinedResult.message,
          );
        }

        setLoading(false);
      };

    loadCommunity();

    return () => {
      active = false;
    };
  }, [communityName]);

  const toggleJoin =
    async () => {
      if (
        !community ||
        membershipLoading
      ) {
        return;
      }

      setMembershipLoading(true);
      setJoinErrorMessage('');

      const result = joined
        ? await leaveCommunity(
            community.name,
          )
        : await joinCommunity(
            community.name,
          );

      if (!result.success) {
        setJoinErrorMessage(
          result.message,
        );

        setMembershipLoading(false);
        return;
      }

      setJoined(
        result.joined,
      );

      setMembershipLoading(false);
    };

  return (
    <SafeAreaView
      style={ui.page}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() =>
            navigation.goBack()
          }
          style={ui.iconButton}
        >
          <PostIcon name="back" />
        </Pressable>

        <Text
          numberOfLines={1}
          style={styles.headerTitle}
        >
          s/{displayName}
        </Text>
      </View>

      {loading ? (
        <View
          style={
            styles.statusContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#ff4500"
          />

          <Text
            style={
              styles.statusText
            }
          >
            Loading community...
          </Text>
        </View>
      ) : errorMessage ? (
        <View
          style={
            styles.statusContainer
          }
        >
          <Text
            style={
              styles.errorText
            }
          >
            {errorMessage}
          </Text>
        </View>
      ) : community ? (
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <View
            style={styles.banner}
          />

          <View
            style={
              styles.communityHeader
            }
          >
            <View
              style={
                styles.avatar
              }
            >
              <Text
                style={
                  styles.avatarText
                }
              >
                {firstLetter}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                joined
                  ? `Leave ${displayName}`
                  : `Join ${displayName}`
              }
              disabled={
                membershipLoading
              }
              onPress={
                toggleJoin
              }
              style={[
                styles.joinButton,

                joined &&
                  styles.joinedButton,

                membershipLoading &&
                  styles.disabledButton,
              ]}
            >
              <Text
                style={[
                  styles.joinText,

                  joined &&
                    styles.joinedText,
                ]}
              >
                {membershipLoading
                  ? '...'
                  : joined
                    ? 'Joined'
                    : 'Join'}
              </Text>
            </Pressable>
          </View>

          {joinErrorMessage ? (
            <Text
              style={
                styles.joinErrorText
              }
            >
              {joinErrorMessage}
            </Text>
          ) : null}

          <View
            style={styles.details}
          >
            <Text
              style={
                styles.communityName
              }
            >
              s/{community.name}
            </Text>

            <Text
              style={
                styles.description
              }
            >
              {community.description ||
                'No description available.'}
            </Text>
            <Text
              style={
                styles.memberCount
              }
            >
              {community.memberCount}{' '}
              {community.memberCount === 1
                ? 'member'
                : 'members'}
            </Text>
          </View>

          <View
            style={
              styles.separator
            }
          />

          <View
            style={
              styles.postsHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Posts
            </Text>
          </View>

          {posts.length === 0 ? (
            <View
              style={
                styles.emptyPosts
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
                style={ui.title}
              >
                No posts yet
              </Text>

              <Text
                style={
                  styles.emptyMessage
                }
              >
                Posts for this
                community will
                appear here.
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.postList
              }
            >
              {posts.map(
                (post) => (
                  <View
                    key={post.id}
                    style={
                      styles.postCard
                    }
                  >
                    <Text
                      style={
                        styles.postTitle
                      }
                    >
                      {post.title}
                    </Text>

                    <Text
                      style={
                        styles.postBody
                      }
                    >
                      {post.body}
                    </Text>

                    <Text
                      style={
                        styles.postMeta
                      }
                    >
                      {post.votes}{' '}
                      votes
                    </Text>
                  </View>
                ),
              )}
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    header: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
      backgroundColor:
        colors.background,
    },

    headerTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 19,
      fontWeight: '700',
    },

    content: {
      paddingBottom: 40,
    },

    statusContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 24,
    },

    statusText: {
      color: colors.muted,
      fontSize: 15,
      textAlign: 'center',
    },

    errorText: {
      color: '#c62828',
      fontSize: 15,
      textAlign: 'center',
    },

    banner: {
      height: 110,
      backgroundColor:
        '#d7dadd',
    },

    communityHeader: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 16,
    },

    avatar: {
      width: 64,
      height: 64,
      marginTop: -24,
      borderRadius: 32,
      borderWidth: 4,
      borderColor: '#fff',
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        '#e8eaed',
    },

    avatarText: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '700',
    },

    joinButton: {
      minWidth: 82,
      height: 38,
      paddingHorizontal: 18,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        '#ff4500',
    },

    joinedButton: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    disabledButton: {
      opacity: 0.6,
    },

    joinText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },

    joinedText: {
      color: colors.text,
    },

    joinErrorText: {
      color: '#c62828',
      fontSize: 13,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },

    details: {
      paddingHorizontal: 16,
      paddingBottom: 18,
    },

    communityName: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
    },

    description: {
      marginTop: 8,
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },

    separator: {
      height: 8,
      backgroundColor:
        '#f1f2f3',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor:
        colors.border,
    },

    postsHeader: {
      paddingHorizontal: 16,
      paddingTop: 18,
    },

    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },

    emptyPosts: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      minHeight: 250,
      paddingHorizontal: 24,
    },

    emptyMessage: {
      color: colors.muted,
      fontSize: 14,
      textAlign: 'center',
    },

    postList: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },

    postCard: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    postTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },

    postBody: {
      marginTop: 6,
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },

    postMeta: {
      marginTop: 8,
      color: colors.muted,
      fontSize: 12,
    },

    memberCount: {
      marginTop: 8,
      color: colors.muted,
      fontSize: 13,
    },
  });