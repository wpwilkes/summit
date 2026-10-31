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
    'SubtopicCommunities'
  >;

export default function SubtopicCommunitiesScreen({
  navigation,
  route,
}: Props) {
  const {
    topic,
    subtopic,
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
         * Only show communities that match
         * both this topic and this subtopic.
         */
        const filteredCommunities =
          result.communities.filter(
            (community) =>
              community.topic === topic &&
              community.subtopic ===
                subtopic,
          );

        setCommunities(
          filteredCommunities,
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
  }, [
    topic,
    subtopic,
  ]);

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
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() =>
            navigation.goBack()
          }
          style={
            ui.iconButton
          }
        >
          <PostIcon
            name="back"
          />
        </Pressable>

        <View
          style={
            styles.headerText
          }
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            {subtopic}
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            {topic}
          </Text>
        </View>
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
          {subtopic}
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          Communities in{' '}
          {topic}
          {' → '}
          {subtopic}
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
              style={
                ui.muted
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
              {
                errorMessage
              }
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
              style={
                styles.emptyTitle
              }
            >
              No communities yet
            </Text>

            <Text
              style={
                styles.emptyMessage
              }
            >
              No communities are
              currently available
              under {topic}
              {' → '}
              {subtopic}.
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
      minHeight: 64,
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

    headerText: {
      flex: 1,
    },

    headerTitle: {
      color:
        colors.text,
      fontSize: 18,
      fontWeight:
        '700',
    },

    headerSubtitle: {
      marginTop: 2,
      color:
        colors.muted,
      fontSize: 12,
    },

    content: {
      padding: 18,
      paddingBottom: 40,
    },

    sectionTitle: {
      color:
        colors.text,
      fontSize: 22,
      fontWeight:
        '700',
    },

    sectionDescription: {
      marginTop: 6,
      marginBottom: 18,
      color:
        colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },

    communityList: {
      gap: 12,
    },

    statusContainer: {
      minHeight: 200,
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
      minHeight: 220,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal:
        24,
    },

    emptyTitle: {
      color:
        colors.text,
      fontSize: 18,
      fontWeight:
        '700',
    },

    emptyMessage: {
      marginTop: 8,
      color:
        colors.muted,
      fontSize: 14,
      lineHeight: 20,
      textAlign:
        'center',
    },
  });