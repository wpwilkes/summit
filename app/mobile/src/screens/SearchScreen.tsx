import { useRef, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SearchPostResult } from '@summit/shared';

import PostIcon from '../components/posts/PostIcon';
import { colors, ui } from '../components/posts/postsTheme';
import SearchBar from '../components/search/SearchBar';
import SearchResultCard from '../components/search/SearchResultCard';

import { searchPosts, validateSearchKeyword } from '../services/searchService';

import type { RootStackParamList } from '../types/navigation.types';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

// The tabs along the top, in the order Reddit shows them.
const TABS = ['Posts', 'Communities', 'Comments', 'Media', 'Profile'] as const;
type Tab = (typeof TABS)[number];

// What the screen is doing right now.
//   idle    - nothing searched yet
//   loading - waiting for the server
//   success - got results (the list may still be empty)
//   error   - the search failed
type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SearchScreen({ navigation }: Props) {
  // What is currently typed in the box.
  const [text, setText] = useState('');
  // The keyword that was actually searched. Tabs and messages use this one,
  // so they do not change while the user is still typing a new search.
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState<Tab>('Posts');
  const [status, setStatus] = useState<Status>('idle');
  const [posts, setPosts] = useState<SearchPostResult[]>([]);
  const [message, setMessage] = useState('');

  // Counts searches. If a slow, older search finishes after a newer one has
  // started, we compare numbers and throw the old answer away.
  const latestSearch = useRef(0);

  const runSearch = async (input: string) => {
    // Step 1: reject bad input without bothering the server.
    const invalid = validateSearchKeyword(input);
    if (invalid) {
      setStatus('error');
      setMessage(invalid);
      setPosts([]);
      return;
    }

    // Step 2: show the loading spinner.
    const searchNumber = ++latestSearch.current;
    const cleanKeyword = input.trim();
    setKeyword(cleanKeyword);
    setStatus('loading');
    setMessage('');

    // Step 3: ask the server, then show what came back.
    const result = await searchPosts(cleanKeyword);
    if (searchNumber !== latestSearch.current) return;

    if (result.success) {
      setPosts(result.posts);
      setStatus('success');
    } else {
      setPosts([]);
      setMessage(result.message);
      setStatus('error');
    }
  };

  const clearSearch = () => {
    // Bump the counter so a search still in flight cannot bring results back.
    latestSearch.current++;
    setText('');
    setKeyword('');
    setPosts([]);
    setMessage('');
    setStatus('idle');
  };

  // Shown under the tabs when there is no list to display.
  const renderPlaceholder = (title: string, detail: string) => (
    <View style={styles.centered}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderDetail}>{detail}</Text>
    </View>
  );

  const renderResults = () => {
    // Only posts can be searched so far. The other tabs are ready in the UI,
    // but their backend search does not exist yet, so say that honestly.
    if (tab !== 'Posts') {
      return renderPlaceholder(
        `${tab} search is coming soon`,
        'For now, only posts can be searched.',
      );
    }
    if (status === 'idle') {
      return renderPlaceholder(
        'Search Summit',
        'Type a keyword to find posts by title or text.',
      );
    }
    if (status === 'loading') {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.placeholderDetail}>Searching…</Text>
        </View>
      );
    }
    if (status === 'error') {
      return (
        <View style={styles.centered}>
          <Text style={styles.placeholderTitle}>Something went wrong</Text>
          <Text style={ui.error}>{message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => runSearch(text)}
            style={[ui.button, styles.retry]}
          >
            <Text style={ui.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    if (posts.length === 0) {
      return renderPlaceholder(
        `No results for “${keyword}”`,
        'Check the spelling or try a different keyword.',
      );
    }
    return (
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Text style={styles.count}>
            {posts.length} {posts.length === 1 ? 'result' : 'results'} for “
            {keyword}”
          </Text>
        }
        renderItem={({ item }) => <SearchResultCard post={item} />}
      />
    );
  };

  return (
    <SafeAreaView style={ui.page}>
      <StatusBar style="dark" />

      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={ui.iconButton}
        >
          <PostIcon name="back" />
        </Pressable>
        <SearchBar
          autoFocus
          value={text}
          onChangeText={setText}
          onSubmit={() => runSearch(text)}
          onClear={clearSearch}
        />
      </View>

      <View style={styles.tabsBorder}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((name) => (
            <Pressable
              key={name}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === name }}
              onPress={() => setTab(name)}
              style={[styles.tab, tab === name && styles.tabActive]}
            >
              <Text
                style={[styles.tabText, tab === name && styles.tabTextActive]}
              >
                {name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={ui.flex}>{renderResults()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabsBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: { paddingHorizontal: 8 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  tabTextActive: { color: colors.text },
  count: {
    color: colors.muted,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholderDetail: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retry: { marginTop: 6 },
});
