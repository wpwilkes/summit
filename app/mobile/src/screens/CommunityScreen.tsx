import {
  useEffect,
  useState,
} from 'react';

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

import PostIcon from '../components/posts/PostIcon';

import {
  colors,
  ui,
} from '../components/posts/postsTheme';

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
    joined,
    setJoined,
  ] = useState(false);

  const firstLetter =
    communityName
      .charAt(0)
      .toUpperCase();

  useEffect(() => {
    recordRecentCommunity({
      id: communityId,
      name: communityName,
    }).catch(() => {
      // Recently Visited is optional local data.
      // A storage error should not stop the
      // community screen from opening.
    });
  }, [
    communityId,
    communityName,
  ]);

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

        <Text
          numberOfLines={1}
          style={styles.headerTitle}
        >
          s/{communityName}
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
        <View style={styles.banner} />

        <View
          style={
            styles.communityHeader
          }
        >
          <View style={styles.avatar}>
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
                ? `Leave ${communityName}`
                : `Join ${communityName}`
            }
            onPress={() =>
              setJoined(
                (current) =>
                  !current,
              )
            }
            style={[
              styles.joinButton,
              joined &&
                styles.joinedButton,
            ]}
          >
            <Text
              style={[
                styles.joinText,
                joined &&
                  styles.joinedText,
              ]}
            >
              {joined
                ? 'Joined'
                : 'Join'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.details}>
          <Text
            style={
              styles.communityName
            }
          >
            s/{communityName}
          </Text>

          <Text
            style={
              styles.description
            }
          >
            Community details will
            appear here when the
            community backend is
            connected.
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

        <View
          style={
            styles.emptyPosts
          }
        >
          <PostIcon
            name="comment"
            size={42}
            color={colors.muted}
          />

          <Text style={ui.title}>
            No posts yet
          </Text>

          <Text
            style={
              styles.emptyMessage
            }
          >
            Posts for this community
            will appear here.
          </Text>
        </View>
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
    fontSize: 19,
    fontWeight: '700',
  },

  content: {
    paddingBottom: 40,
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
    justifyContent: 'center',
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
    justifyContent: 'center',
    backgroundColor:
      '#ff4500',
  },

  joinedButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  joinText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  joinedText: {
    color: colors.text,
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
});