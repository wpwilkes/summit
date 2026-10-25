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
  'TopicCommunities'
>;

type Community = {
  id: string;
  name: string;
  description: string;
  memberCount: string;
};

type TopicData = {
  subtopics: string[];
  communities: Community[];
};

const topicData: Record<
  string,
  TopicData
> = {
  'Internet Culture': {
    subtopics: [
      'Amazing',
      'Memes',
      'Funny',
      'Social Media',
    ],

    communities: [
      {
        id: 'interesting',
        name: 'interesting',
        memberCount:
          '720K members',
        description:
          'Interesting things from around the internet.',
      },
      {
        id: 'memes',
        name: 'memes',
        memberCount:
          '1.8M members',
        description:
          'Memes, jokes, and internet culture.',
      },
      {
        id: 'funny',
        name: 'funny',
        memberCount:
          '2.4M members',
        description:
          'Funny posts, videos, and conversations.',
      },
    ],
  },

  Games: {
    subtopics: [
      'PC Gaming',
      'Console',
      'Mobile',
      'Esports',
    ],

    communities: [
      {
        id: 'gaming',
        name: 'gaming',
        memberCount:
          '2.1M members',
        description:
          'General discussion about games and gaming.',
      },
      {
        id: 'pcgaming',
        name: 'pcgaming',
        memberCount:
          '950K members',
        description:
          'PC games, hardware, releases, and discussion.',
      },
      {
        id: 'esports',
        name: 'esports',
        memberCount:
          '610K members',
        description:
          'Competitive gaming, tournaments, and esports news.',
      },
    ],
  },

  'Q&As': {
    subtopics: [
      'Ask Anything',
      'Advice',
      'Experts',
    ],

    communities: [
      {
        id: 'ask',
        name: 'ask',
        memberCount:
          '890K members',
        description:
          'Ask questions and get answers from the community.',
      },
      {
        id: 'advice',
        name: 'advice',
        memberCount:
          '540K members',
        description:
          'A place to ask for general advice.',
      },
    ],
  },

  Technology: {
    subtopics: [
      'Programming',
      'AI',
      'Hardware',
      'Mobile',
    ],

    communities: [
      {
        id: 'technology',
        name: 'technology',
        memberCount:
          '1.2M members',
        description:
          'Technology news, devices, software, and discussion.',
      },
      {
        id: 'programming',
        name: 'programming',
        memberCount:
          '842K members',
        description:
          'Programming questions, projects, and resources.',
      },
      {
        id: 'artificialintelligence',
        name: 'artificialintelligence',
        memberCount:
          '630K members',
        description:
          'Artificial intelligence news and discussion.',
      },
    ],
  },

  'Pop Culture': {
    subtopics: [
      'Celebrities',
      'Music',
      'Trending',
    ],

    communities: [
      {
        id: 'popculture',
        name: 'popculture',
        memberCount:
          '670K members',
        description:
          'Entertainment, celebrities, trends, and culture.',
      },
      {
        id: 'music',
        name: 'music',
        memberCount:
          '1.1M members',
        description:
          'Music discussion, artists, albums, and songs.',
      },
    ],
  },

  'Movies & TV': {
    subtopics: [
      'Movies',
      'Television',
      'Streaming',
    ],

    communities: [
      {
        id: 'movies',
        name: 'movies',
        memberCount:
          '980K members',
        description:
          'Movies, trailers, reviews, and upcoming releases.',
      },
      {
        id: 'television',
        name: 'television',
        memberCount:
          '760K members',
        description:
          'Television shows, series, episodes, and discussion.',
      },
    ],
  },

  Education: {
    subtopics: [
      'Students',
      'Learning',
      'College',
      'Teachers',
    ],

    communities: [
      {
        id: 'education',
        name: 'education',
        memberCount:
          '430K members',
        description:
          'Education, schools, learning, and teaching.',
      },
      {
        id: 'college',
        name: 'college',
        memberCount:
          '590K members',
        description:
          'College life, classes, studying, and student questions.',
      },
    ],
  },

  Science: {
    subtopics: [
      'Space',
      'Biology',
      'Physics',
      'Environment',
    ],

    communities: [
      {
        id: 'science',
        name: 'science',
        memberCount:
          '1.4M members',
        description:
          'Science research, discoveries, and discussion.',
      },
      {
        id: 'space',
        name: 'space',
        memberCount:
          '850K members',
        description:
          'Space exploration, astronomy, planets, and missions.',
      },
      {
        id: 'physics',
        name: 'physics',
        memberCount:
          '410K members',
        description:
          'Physics questions, research, and discussion.',
      },
    ],
  },
};

export default function TopicCommunitiesScreen({
  navigation,
  route,
}: Props) {
  const { topic } =
    route.params;

  const [
    joinedCommunityIds,
    setJoinedCommunityIds,
  ] = useState<string[]>([]);

  const data =
    topicData[topic] ?? {
      subtopics: [],
      communities: [],
    };

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
        <Text style={styles.sectionTitle}>
          Explore {topic}
        </Text>

        {data.subtopics.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.subtopicRow
            }
          >
            {data.subtopics.map(
              (subtopic) => (
                <Pressable
                  key={subtopic}
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

        {data.communities.length > 0 ? (
          <View
            style={
              styles.communityList
            }
          >
            {data.communities.map(
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
        ) : (
          <View style={styles.empty}>
            <Text style={ui.muted}>
              No communities available
              for this topic yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  subtopicRow: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  subtopicChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor:
      colors.border,
    backgroundColor: '#fff',
  },

  subtopicText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },

  communityTitle: {
    marginTop: 30,
  },

  communityList: {
    paddingHorizontal: 16,
    marginTop: 8,
  },

  empty: {
    paddingHorizontal: 16,
    paddingVertical: 30,
  },

  pressed: {
    opacity: 0.7,
  },
});