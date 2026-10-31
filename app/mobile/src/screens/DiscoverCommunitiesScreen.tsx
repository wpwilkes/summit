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
} from '@summit/shared';

import CommunityCard from '../components/communities/CommunityCard';
import PostIcon from '../components/posts/PostIcon';

import {
  colors,
  ui,
} from '../components/posts/postsTheme';

import {
  getCommunities,
  getJoinedCommunities,
  joinCommunity,
  leaveCommunity,
} from '../services/communityService';

import type {
  RootStackParamList,
} from '../types/navigation.types';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'DiscoverCommunities'
  >;

const topics = [
  'Internet Culture',
  'Games',
  'Q&As',
  'Technology',
  'Pop Culture',
  'Movies & TV',
  'Education',
  'Science',
];

export default function DiscoverCommunitiesScreen({
  navigation,
}: Props) {
  const [
    communities,
    setCommunities,
  ] = useState<Community[]>([]);

  const [
    joinedCommunityIds,
    setJoinedCommunityIds,
  ] = useState<number[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    joinErrorMessage,
    setJoinErrorMessage,
  ] = useState('');

  useEffect(() => {
    let active = true;

    const loadCommunities =
      async () => {
        setLoading(true);
        setErrorMessage('');
        setJoinErrorMessage('');

        const communitiesResult =
          await getCommunities();

        if (!active) {
          return;
        }

        if (!communitiesResult.success) {
          setCommunities([]);
          setErrorMessage(
            communitiesResult.message,
          );
          setLoading(false);
          return;
        }

        setCommunities(
          communitiesResult.communities,
        );

        const joinedResult =
          await getJoinedCommunities();

        if (!active) {
          return;
        }

        if (joinedResult.success) {
          setJoinedCommunityIds(
            joinedResult.communities.map(
              (community) =>
                community.id,
            ),
          );
        } else {
          setJoinedCommunityIds([]);
          setJoinErrorMessage(
            joinedResult.message,
          );
        }

        setLoading(false);
      };

    loadCommunities();

    return () => {
      active = false;
    };
  }, []);

  const toggleJoin = async (
    community: Community,
  ) => {
    setJoinErrorMessage('');

    const isJoined =
      joinedCommunityIds.includes(
        community.id,
      );

    const result = isJoined
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
      return;
    }

    if (result.joined) {
      setJoinedCommunityIds(
        (current) => {
          if (
            current.includes(
              community.id,
            )
          ) {
            return current;
          }

          return [
            ...current,
            community.id,
          ];
        },
      );
    } else {
      setJoinedCommunityIds(
        (current) =>
          current.filter(
            (id) =>
              id !== community.id,
          ),
      );
    }
  };

  return (
    <SafeAreaView style={ui.page}>
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

        <Text style={styles.headerTitle}>
          Discover Communities
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.sectionTitle}>
          Explore topics
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.topicRow
          }
        >
          {topics.map(
            (topic) => (
              <Pressable
                key={topic}
                accessibilityRole="button"
                accessibilityLabel={`Open ${topic} communities`}
                onPress={() =>
                  navigation.navigate(
                    'TopicCommunities',
                    {
                      topic,
                    },
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.topicChip,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.topicText
                  }
                >
                  {topic}
                </Text>
              </Pressable>
            ),
          )}
        </ScrollView>

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Communities
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            Explore communities
            available on Summit.
          </Text>
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
              Loading communities...
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
        ) : communities.length ===
          0 ? (
          <View
            style={
              styles.statusContainer
            }
          >
            <Text
              style={
                styles.statusText
              }
            >
              No communities are
              available yet.
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.communityList
            }
          >
            {communities.map(
              (community) => (
                <CommunityCard
                  key={
                    community.id
                  }
                  name={
                    community.name
                  }
                  description={
                    community.description
                  }
                  memberCount={`${community.memberCount} ${
                    community.memberCount === 1
                      ? 'member'
                      : 'members'
                  }`}
                  joined={joinedCommunityIds.includes(
                    community.id,
                  )}
                  onPress={() =>
                    navigation.navigate(
                      'Community',
                      {
                        communityId:
                          String(
                            community.id,
                          ),

                        communityName:
                          community.name,
                      },
                    )
                  }
                  onJoinPress={() =>
                    toggleJoin(
                      community,
                    )
                  }
                />
              ),
            )}
          </View>
        )}
      </ScrollView>
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
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },

    content: {
      paddingBottom: 40,
    },

    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      paddingHorizontal: 16,
      marginTop: 22,
    },

    topicRow: {
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 4,
    },

    topicChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor: '#fff',
    },

    topicText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },

    sectionHeader: {
      marginTop: 12,
    },

    sectionDescription: {
      color: colors.muted,
      fontSize: 14,
      marginTop: 6,
      paddingHorizontal: 16,
    },

    communityList: {
      marginTop: 8,
      paddingHorizontal: 16,
    },

    statusContainer: {
      minHeight: 180,
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

    joinErrorText: {
      color: '#c62828',
      fontSize: 14,
      marginTop: 12,
      paddingHorizontal: 16,
    },

    pressed: {
      opacity: 0.7,
    },
  });