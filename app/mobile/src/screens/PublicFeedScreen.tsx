import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import GuestActionModal from '../components/GuestActionModal';
import PostCard from '../components/PostCard';
import PublicFeedDrawer from '../components/PublicFeedDrawer';
import { mockPosts } from '../data/mockPosts';
import { RootStackParamList } from '../types/navigation.types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'PublicFeed'
>;

type FeedSort = 'Hot' | 'New' | 'Top';

const QUICK_TOPICS = [
  'All',
  'AI',
  'Policy',
  'Backend',
  'Astronomy',
  'Discussion',
] as const;

type FeedTopic =
  (typeof QUICK_TOPICS)[number];

export default function PublicFeedScreen({
  navigation,
}: Props) {
  const [searchText, setSearchText] = useState('');

  const [selectedSort, setSelectedSort] =
    useState<FeedSort>('Hot');

  const [selectedTopic, setSelectedTopic] =
    useState<FeedTopic>('All');

  const [isDrawerVisible, setIsDrawerVisible] =
    useState(false);

  const [isGuestModalVisible, setIsGuestModalVisible] =
    useState(false);

  const searchInputRef = useRef<TextInput>(null);

  const dismissSearchFocus = () => {
    searchInputRef.current?.blur();
  };

  const displayedPosts = useMemo(() => {
    const normalizedSearch =
      searchText.trim().toLowerCase();

    const filteredPosts = mockPosts.filter((post) => {
      const matchesTopic =
        selectedTopic === 'All' ||
        post.category.toLowerCase() ===
          selectedTopic.toLowerCase() ||
        post.tags.some(
          (tag) =>
            tag.toLowerCase() ===
            selectedTopic.toLowerCase()
        );

      if (!matchesTopic) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        post.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        post.description
          .toLowerCase()
          .includes(normalizedSearch) ||
        post.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        post.community
          .toLowerCase()
          .includes(normalizedSearch) ||
        post.tags.some((tag) =>
          tag
            .toLowerCase()
            .includes(normalizedSearch)
        )
      );
    });

    /*
     * Temporary frontend sorting.
     * Later the backend can return the
     * correct Hot / New / Top order.
     */
    if (selectedSort === 'Top') {
      return [...filteredPosts].sort(
        (firstPost, secondPost) =>
          secondPost.voteCount -
          firstPost.voteCount
      );
    }

    if (selectedSort === 'New') {
      return [...filteredPosts].reverse();
    }

    return filteredPosts;
  }, [
    searchText,
    selectedSort,
    selectedTopic,
  ]);

  const openDrawer = () => {
    dismissSearchFocus();
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  const handleHeaderLogin = () => {
    dismissSearchFocus();
    navigation.navigate('Login');
  };

  const handleHeaderSignup = () => {
    dismissSearchFocus();
    navigation.navigate('Signup');
  };

  const handleDrawerLogin = () => {
    closeDrawer();
    navigation.navigate('Login');
  };

  const handleDrawerSignup = () => {
    closeDrawer();
    navigation.navigate('Signup');
  };

  const handleSortChange = (
    sortOption: FeedSort
  ) => {
    dismissSearchFocus();
    setSelectedSort(sortOption);
  };

  const handleTopicChange = (
    topic: FeedTopic
  ) => {
    dismissSearchFocus();
    setSelectedTopic(topic);
  };

  const handleCreatePost = () => {
    dismissSearchFocus();
    setIsGuestModalVisible(true);
  };

  const closeGuestModal = () => {
    setIsGuestModalVisible(false);
  };

  const handleGuestLogin = () => {
    closeGuestModal();
    navigation.navigate('Login');
  };

  const handleGuestSignup = () => {
    closeGuestModal();
    navigation.navigate('Signup');
  };

  const listHeader = (
    <View>
      {/* Summit Header */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.menuButton}
            onPress={openDrawer}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Text style={styles.menuIcon}>
              ☰
            </Text>
          </Pressable>

          <View style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>
                S
              </Text>
            </View>

            <Text style={styles.brandName}>
              Summit
            </Text>
          </View>
        </View>

        <View style={styles.authButtons}>
          <Pressable
            style={styles.loginButton}
            onPress={handleHeaderLogin}
          >
            <Text style={styles.loginButtonText}>
              Log In
            </Text>
          </Pressable>

          <Pressable
            style={styles.signupButton}
            onPress={handleHeaderSignup}
          >
            <Text style={styles.signupButtonText}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Guest Message */}

      <View style={styles.guestNotice}>
        <Text style={styles.guestNoticeTitle}>
          Browse Summit
        </Text>

        <Text style={styles.guestNoticeText}>
          You can explore discussions without an
          account. Log in or sign up to join the
          conversation.
        </Text>
      </View>

      {/* Search */}

      <TextInput
        ref={searchInputRef}
        style={styles.searchInput}
        placeholder="Search discussions..."
        placeholderTextColor="#777777"
        value={searchText}
        onChangeText={setSearchText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {/* Feed Sort */}

      <View style={styles.sortContainer}>
        {(['Hot', 'New', 'Top'] as FeedSort[]).map(
          (sortOption) => {
            const isSelected =
              selectedSort === sortOption;

            return (
              <Pressable
                key={sortOption}
                style={[
                  styles.sortButton,
                  isSelected
                    ? styles.sortButtonSelected
                    : null,
                ]}
                onPress={() =>
                  handleSortChange(sortOption)
                }
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    isSelected
                      ? styles.sortButtonTextSelected
                      : null,
                  ]}
                >
                  {sortOption}
                </Text>
              </Pressable>
            );
          }
        )}
      </View>

      {/* Topics */}

      <View style={styles.topicSection}>
        <View style={styles.topicHeadingRow}>
          <Text style={styles.topicHeading}>
            Topics
          </Text>

          <Text style={styles.topicHint}>
            Swipe to explore
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.topicScrollContent
          }
        >
          {QUICK_TOPICS.map((topic) => {
            const isSelected =
              selectedTopic === topic;

            return (
              <Pressable
                key={topic}
                style={[
                  styles.topicChip,
                  isSelected
                    ? styles.topicChipSelected
                    : null,
                ]}
                onPress={() =>
                  handleTopicChange(topic)
                }
              >
                <Text
                  style={[
                    styles.topicChipText,
                    isSelected
                      ? styles.topicChipTextSelected
                      : null,
                  ]}
                >
                  {topic}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Create Post */}

      <Pressable
        style={styles.createPostButton}
        onPress={handleCreatePost}
        accessibilityRole="button"
        accessibilityLabel="Create post"
      >
        <Text style={styles.createPostIcon}>
          +
        </Text>

        <Text style={styles.createPostText}>
          Create Post
        </Text>
      </Pressable>

      {/* Feed Heading */}

      <View style={styles.feedHeading}>
        <Text style={styles.feedTitle}>
          Discussions
        </Text>

        <Text style={styles.feedCount}>
          {displayedPosts.length}{' '}
          {displayedPosts.length === 1
            ? 'post'
            : 'posts'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={displayedPosts}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => (
          <PostCard post={item} />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No discussions found
            </Text>

            <Text style={styles.emptyText}>
              Try another topic or search.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />

      <PublicFeedDrawer
        visible={isDrawerVisible}
        onClose={closeDrawer}
        onLogin={handleDrawerLogin}
        onSignup={handleDrawerSignup}
      />

      <GuestActionModal
        visible={isGuestModalVisible}
        onClose={closeGuestModal}
        onLogin={handleGuestLogin}
        onSignup={handleGuestSignup}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f10',
  },

  listContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  menuButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },

  menuIcon: {
    color: '#e7c86e',
    fontSize: 25,
    fontWeight: '600',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBox: {
    width: 34,
    height: 34,
    backgroundColor: '#e7c86e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },

  logoText: {
    color: '#111111',
    fontSize: 18,
    fontWeight: 'bold',
  },

  brandName: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '600',
  },

  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  loginButton: {
    paddingHorizontal: 7,
    paddingVertical: 8,
    marginRight: 4,
  },

  loginButtonText: {
    color: '#e7c86e',
    fontSize: 12,
    fontWeight: '600',
  },

  signupButton: {
    backgroundColor: '#e7c86e',
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 4,
  },

  signupButtonText: {
    color: '#111111',
    fontSize: 12,
    fontWeight: '700',
  },

  guestNotice: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#2b2b2f',
    padding: 14,
    marginBottom: 14,
  },

  guestNoticeTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },

  guestNoticeText: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
  },

  searchInput: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#333337',
    borderRadius: 4,
    color: '#ffffff',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },

  sortContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#2b2b2f',
    padding: 4,
    marginBottom: 18,
  },

  sortButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
  },

  sortButtonSelected: {
    backgroundColor: '#2a271e',
  },

  sortButtonText: {
    color: '#777777',
    fontSize: 13,
    fontWeight: '600',
  },

  sortButtonTextSelected: {
    color: '#e7c86e',
  },

  topicSection: {
    marginBottom: 18,
  },

  topicHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  topicHeading: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  topicHint: {
    color: '#666666',
    fontSize: 11,
  },

  topicScrollContent: {
    paddingRight: 14,
  },

  topicChip: {
    borderWidth: 1,
    borderColor: '#333337',
    backgroundColor: '#18181b',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },

  topicChipSelected: {
    backgroundColor: '#e7c86e',
    borderColor: '#e7c86e',
  },

  topicChipText: {
    color: '#aaaaaa',
    fontSize: 12,
    fontWeight: '600',
  },

  topicChipTextSelected: {
    color: '#111111',
  },

  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e7c86e',
    borderRadius: 6,
    paddingVertical: 12,
    marginBottom: 22,
  },

  createPostIcon: {
    color: '#111111',
    fontSize: 21,
    lineHeight: 22,
    fontWeight: '500',
    marginRight: 7,
  },

  createPostText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
  },

  feedHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  feedTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },

  feedCount: {
    color: '#777777',
    fontSize: 12,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },

  emptyText: {
    color: '#777777',
    fontSize: 13,
    marginTop: 6,
  },
});