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
    'TopicCommunities'
  >;

const TOPIC_SUBTOPICS: Record<
  string,
  string[]
> = {
  'Internet Culture': [
    'Memes',
    'Social Media',
    'Online Communities',
    'Creators',
  ],

  Games: [
    'PC Gaming',
    'Console Gaming',
    'Mobile Gaming',
    'Esports',
  ],

  'Q&As': [
    'General Q&A',
    'Advice',
    'Ask Me Anything',
    'Learning',
  ],

  Technology: [
    'Programming',
    'AI',
    'Hardware',
    'Mobile',
  ],

  'Pop Culture': [
    'Celebrities',
    'Music',
    'Trends',
    'Entertainment',
  ],

  'Movies & TV': [
    'Movies',
    'Television',
    'Streaming',
    'Reviews',
  ],

  Education: [
    'College',
    'Study Help',
    'Careers',
    'Online Learning',
  ],

  Science: [
    'Space',
    'Biology',
    'Physics',
    'Environment',
  ],
};

export default function TopicCommunitiesScreen({
  navigation,
  route,
}: Props) {
  const {
    topic,
  } = route.params;

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

  const subtopics =
    TOPIC_SUBTOPICS[
      topic
    ] ?? [];

  useEffect(() => {
    let active = true;

    const loadCommunities =
      async () => {
        setLoading(true);
        setErrorMessage('');
        setJoinErrorMessage('');

        const result =
          await getCommunities();

        if (!active) {
          return;
        }

        if (!result.success) {
          setCommunities([]);
          setErrorMessage(
            result.message,
          );
          setLoading(false);
          return;
        }

        /*
         * Only show communities
         * belonging to this topic.
         */
        const topicCommunities =
          result.communities.filter(
            (community) =>
              community.topic ===
              topic,
          );

        setCommunities(
          topicCommunities,
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
  }, [topic]);

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
    <SafeAreaView
      style={ui.page}
    >
      <StatusBar style="dark" />

      <View
        style={styles.header}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() =>
            navigation.goBack()
          }
          style={ui.iconButton}
        >
          <PostIcon
            name="back"
          />
        </Pressable>

        <Text
          style={
            styles.headerTitle
          }
        >
          {topic}
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
        <Text
          style={
            styles.sectionTitle
          }
        >
          Explore {topic}
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          Choose a subtopic or
          explore communities in
          this topic.
        </Text>

        {subtopics.length >
        0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.subtopicRow
            }
          >
            {subtopics.map(
              (subtopic) => (
                <Pressable
                  key={
                    subtopic
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${subtopic} communities`}
                  onPress={() =>
                    navigation.navigate(
                      'SubtopicCommunities',
                      {
                        topic,
                        subtopic,
                      },
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.subtopicChip,

                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.subtopicText
                    }
                  >
                    {subtopic}
                  </Text>
                </Pressable>
              ),
            )}
          </ScrollView>
        ) : null}

        <Text
          style={[
            styles.sectionTitle,
            styles.communityTitle,
          ]}
        >
          Communities
        </Text>

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
              style={ui.muted}
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
        ) : communities.length >
          0 ? (
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
        ) : (
          <View
            style={
              styles.empty
            }
          >
            <Text
              style={ui.muted}
            >
              No communities are
              available for this
              topic yet.
            </Text>
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
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 10,
      paddingHorizontal:
        12,
      borderBottomWidth:
        1,
      borderBottomColor:
        colors.border,
      backgroundColor:
        colors.background,
    },

    headerTitle: {
      flex: 1,
      color:
        colors.text,
      fontSize: 19,
      fontWeight:
        '700',
    },

    content: {
      padding: 18,
      paddingBottom: 40,
    },

    sectionTitle: {
      color:
        colors.text,
      fontSize: 21,
      fontWeight:
        '700',
    },

    sectionDescription: {
      marginTop: 6,
      color:
        colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },

    subtopicRow: {
      gap: 8,
      paddingTop: 16,
      paddingBottom: 4,
    },

    subtopicChip: {
      minHeight: 38,
      justifyContent:
        'center',
      paddingHorizontal:
        15,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 20,
      backgroundColor:
        '#fff',
    },

    subtopicText: {
      color:
        colors.text,
      fontSize: 14,
      fontWeight:
        '600',
    },

    communityTitle: {
      marginTop: 28,
      marginBottom: 12,
    },

    communityList: {
      gap: 12,
    },

    statusContainer: {
      minHeight: 180,
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 12,
    },

    errorText: {
      color:
        '#c62828',
      fontSize: 14,
      textAlign:
        'center',
    },

    joinErrorText: {
      color:
        '#c62828',
      fontSize: 14,
      marginBottom: 12,
    },

    empty: {
      minHeight: 160,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal:
        20,
    },

    pressed: {
      opacity: 0.7,
    },
  });