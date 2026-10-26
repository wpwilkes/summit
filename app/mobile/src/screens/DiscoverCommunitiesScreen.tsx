import { useState } from 'react';

import {
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

import CommunityCard from '../components/communities/CommunityCard';
import PostIcon from '../components/posts/PostIcon';

import {
  colors,
  ui,
} from '../components/posts/postsTheme';

import type {
  RootStackParamList,
} from '../types/navigation.types';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'DiscoverCommunities'
  >;

type Community = {
  id: string;
  name: string;
  description: string;
  memberCount: string;
};

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

const recommendedCommunities:
  Community[] = [
  {
    id: 'technology',
    name: 'technology',
    memberCount:
      '1.2M members',
    description:
      'News and discussion about technology, devices, software, and the digital world.',
  },

  {
    id: 'programming',
    name: 'programming',
    memberCount:
      '842K members',
    description:
      'A community for programming discussions, projects, questions, and useful resources.',
  },

  {
    id: 'gaming',
    name: 'gaming',
    memberCount:
      '2.1M members',
    description:
      'Talk about games, consoles, releases, gaming news, and the games you enjoy.',
  },

  {
    id: 'movies',
    name: 'movies',
    memberCount:
      '980K members',
    description:
      'Discuss movies, trailers, reviews, actors, directors, and upcoming releases.',
  },

  {
    id: 'science',
    name: 'science',
    memberCount:
      '1.4M members',
    description:
      'Share and discuss science news, research, discoveries, and interesting questions.',
  },
];

export default function DiscoverCommunitiesScreen({
  navigation,
}: Props) {
  const [
    joinedCommunityIds,
    setJoinedCommunityIds,
  ] = useState<string[]>([]);

  const toggleJoin = (
    communityId: string,
  ) => {
    setJoinedCommunityIds(
      (current) => {
        if (
          current.includes(
            communityId,
          )
        ) {
          return current.filter(
            (id) =>
              id !== communityId,
          );
        }

        return [
          ...current,
          communityId,
        ];
      },
    );
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
            Recommended for you
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            Communities you may
            want to explore.
          </Text>
        </View>

        <View
          style={
            styles.communityList
          }
        >
          {recommendedCommunities.map(
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
                memberCount={
                  community.memberCount
                }
                joined={joinedCommunityIds.includes(
                  community.id,
                )}
                onPress={() =>
                  navigation.navigate(
                    'Community',
                    {
                      communityId:
                        community.id,

                      communityName:
                        community.name,
                    },
                  )
                }
                onJoinPress={() =>
                  toggleJoin(
                    community.id,
                  )
                }
              />
            ),
          )}
        </View>
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

    pressed: {
      opacity: 0.7,
    },
  });