import { useState } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import CommunityCard from '../components/communities/CommunityCard';
import PostIcon from '../components/posts/PostIcon';

import {
  colors,
  ui,
} from '../components/posts/postsTheme';

import type { RootStackParamList } from '../types/navigation.types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'SubtopicCommunities'
>;

type Community = {
  id: string;
  name: string;
  description: string;
  memberCount: string;
};

const subtopicCommunities: Record<
  string,
  Community[]
> = {
  Amazing: [
    {
      id: 'interestingashell',
      name: 'interestingashell',
      memberCount:
        '1.3M members',
      description:
        'Amazing, unusual, and interesting things worth sharing.',
    },
    {
      id: 'damnthatsinteresting',
      name: 'damnthatsinteresting',
      memberCount:
        '980K members',
      description:
        'Interesting images, stories, discoveries, and facts.',
    },
    {
      id: 'nextfuckinglevel',
      name: 'nextfuckinglevel',
      memberCount:
        '870K members',
      description:
        'People and things showing impressive skill and talent.',
    },
  ],

  Memes: [
    {
      id: 'memes',
      name: 'memes',
      memberCount:
        '1.8M members',
      description:
        'Memes, jokes, and internet humor.',
    },
    {
      id: 'dankmemes',
      name: 'dankmemes',
      memberCount:
        '1.1M members',
      description:
        'Internet memes and community humor.',
    },
  ],

  Funny: [
    {
      id: 'funny',
      name: 'funny',
      memberCount:
        '2.4M members',
      description:
        'Funny images, videos, stories, and conversations.',
    },
    {
      id: 'contagiouslaughter',
      name: 'contagiouslaughter',
      memberCount:
        '460K members',
      description:
        'Videos and moments where laughter is hard to resist.',
    },
  ],

  'Social Media': [
    {
      id: 'socialmedia',
      name: 'socialmedia',
      memberCount:
        '380K members',
      description:
        'Discussion about social platforms and online communities.',
    },
    {
      id: 'internet',
      name: 'internet',
      memberCount:
        '510K members',
      description:
        'News and discussion about life on the internet.',
    },
  ],

  'PC Gaming': [
    {
      id: 'pcgaming',
      name: 'pcgaming',
      memberCount:
        '950K members',
      description:
        'PC gaming news, hardware, releases, and discussion.',
    },
    {
      id: 'buildapc',
      name: 'buildapc',
      memberCount:
        '740K members',
      description:
        'PC building advice, hardware choices, and troubleshooting.',
    },
  ],

  Console: [
    {
      id: 'console',
      name: 'console',
      memberCount:
        '610K members',
      description:
        'Console gaming news, games, and discussion.',
    },
    {
      id: 'playstation',
      name: 'playstation',
      memberCount:
        '830K members',
      description:
        'PlayStation news, games, hardware, and discussion.',
    },
  ],

  Mobile: [
    {
      id: 'mobilegaming',
      name: 'mobilegaming',
      memberCount:
        '420K members',
      description:
        'Mobile games, releases, recommendations, and discussion.',
    },
    {
      id: 'android',
      name: 'android',
      memberCount:
        '760K members',
      description:
        'Android devices, software, apps, and mobile technology.',
    },
  ],

  Esports: [
    {
      id: 'esports',
      name: 'esports',
      memberCount:
        '610K members',
      description:
        'Competitive gaming, tournaments, teams, and esports news.',
    },
  ],

  Programming: [
    {
      id: 'programming',
      name: 'programming',
      memberCount:
        '842K members',
      description:
        'Programming news, questions, projects, and resources.',
    },
    {
      id: 'learnprogramming',
      name: 'learnprogramming',
      memberCount:
        '690K members',
      description:
        'A community for people learning how to program.',
    },
    {
      id: 'webdev',
      name: 'webdev',
      memberCount:
        '540K members',
      description:
        'Web development, frontend, backend, and related technologies.',
    },
  ],

  AI: [
    {
      id: 'artificialintelligence',
      name: 'artificialintelligence',
      memberCount:
        '630K members',
      description:
        'Artificial intelligence news, research, and discussion.',
    },
    {
      id: 'machinelearning',
      name: 'machinelearning',
      memberCount:
        '580K members',
      description:
        'Machine learning research, projects, and technical discussion.',
    },
  ],

  Hardware: [
    {
      id: 'hardware',
      name: 'hardware',
      memberCount:
        '470K members',
      description:
        'Computer hardware, processors, GPUs, and devices.',
    },
    {
      id: 'buildapc',
      name: 'buildapc',
      memberCount:
        '740K members',
      description:
        'Help and discussion about building computers.',
    },
  ],

  Space: [
    {
      id: 'space',
      name: 'space',
      memberCount:
        '850K members',
      description:
        'Space exploration, astronomy, planets, and missions.',
    },
    {
      id: 'astronomy',
      name: 'astronomy',
      memberCount:
        '470K members',
      description:
        'Astronomy, telescopes, stars, planets, and the universe.',
    },
  ],

  Biology: [
    {
      id: 'biology',
      name: 'biology',
      memberCount:
        '390K members',
      description:
        'Biology research, questions, and scientific discussion.',
    },
  ],

  Physics: [
    {
      id: 'physics',
      name: 'physics',
      memberCount:
        '410K members',
      description:
        'Physics questions, research, and discussion.',
    },
  ],

  Environment: [
    {
      id: 'environment',
      name: 'environment',
      memberCount:
        '520K members',
      description:
        'Environmental science, conservation, and climate discussion.',
    },
  ],
};

export default function SubtopicCommunitiesScreen({
  navigation,
  route,
}: Props) {
  const {
    topic,
    subtopic,
  } = route.params;

  const [
    joinedCommunityIds,
    setJoinedCommunityIds,
  ] = useState<string[]>([]);

  const communities =
    subtopicCommunities[
      subtopic
    ] ?? [];

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

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            {subtopic}
          </Text>

          <Text style={styles.topicLabel}>
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
        <Text style={styles.sectionTitle}>
          {subtopic} communities
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          Explore communities related
          to {subtopic}.
        </Text>

        {communities.length > 0 ? (
          <View
            style={
              styles.communityList
            }
          >
            {communities.map(
              (
                community,
                index,
              ) => (
                <View
                  key={
                    community.id
                  }
                  style={
                    styles.rankedRow
                  }
                >
                  <Text
                    style={
                      styles.rank
                    }
                  >
                    {index + 1}
                  </Text>

                  <View
                    style={
                      styles.cardContainer
                    }
                  >
                    <CommunityCard
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
                  </View>
                </View>
              ),
            )}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={ui.muted}>
              No communities available
              for this subtopic yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
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

  headerText: {
    flex: 1,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },

  topicLabel: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
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

  sectionDescription: {
    color: colors.muted,
    fontSize: 14,
    paddingHorizontal: 16,
    marginTop: 6,
  },

  communityList: {
    marginTop: 10,
    paddingHorizontal: 12,
  },

  rankedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rank: {
    width: 28,
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },

  cardContainer: {
    flex: 1,
  },

  empty: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
});