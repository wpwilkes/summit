import { useRef, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { SearchPostResult } from '@summit/shared';

import PostIcon from '../components/posts/PostIcon';
import { colors, ui } from '../components/posts/postsTheme';
import SearchBar from '../components/search/SearchBar';
import SearchResultCard from '../components/search/SearchResultCard';

import {
  searchPosts,
  searchPostsByImage,
  validateSearchKeyword,
  type SearchImage,
} from '../services/searchService';

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

// Where the picture for an image search comes from.
type ImageSource = 'camera' | 'library';

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
  // Search by image: the picture that was searched (null for a text search),
  // the words the AI saw in it, and whether the camera/library choice is open.
  const [searchedImage, setSearchedImage] = useState<SearchImage | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [choosingImage, setChoosingImage] = useState(false);

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
    setSearchedImage(null);
    setKeywords([]);
    setChoosingImage(false);
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

  // Search with a picture: the server's AI says what the picture shows, then
  // finds posts whose title, text or comments mention it.
  const runImageSearch = async (image: SearchImage) => {
    const searchNumber = ++latestSearch.current;
    setText('');
    setKeyword('');
    setKeywords([]);
    setSearchedImage(image);
    setTab('Posts');
    setStatus('loading');
    setMessage('');

    const result = await searchPostsByImage(image);
    if (searchNumber !== latestSearch.current) return;

    if (result.success) {
      setKeywords(result.keywords);
      setPosts(result.posts);
      setStatus('success');
    } else {
      setPosts([]);
      setMessage(result.message);
      setStatus('error');
    }
  };

  // Show a problem with picking a picture, the same way as a failed search.
  const showImageError = (text: string) => {
    latestSearch.current++;
    setSearchedImage(null);
    setKeywords([]);
    setPosts([]);
    setMessage(text);
    setStatus('error');
  };

  // Open the camera or the photo library, then search with the chosen picture.
  const pickImage = async (source: ImageSource) => {
    setChoosingImage(false);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          showImageError('Allow camera access to search with a photo.');
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset || (asset.mimeType && !asset.mimeType.startsWith('image/'))) {
        showImageError(
          'Choose a picture. Videos and documents are not supported.',
        );
        return;
      }
      await runImageSearch({
        uri: asset.uri,
        mimeType: asset.mimeType ?? undefined,
      });
    } catch {
      showImageError(
        source === 'camera'
          ? 'Could not open the camera. Please try again.'
          : 'Could not open your pictures. Please try again.',
      );
    }
  };

  // "Try again" repeats whichever kind of search failed.
  const retry = () => {
    if (searchedImage) {
      runImageSearch(searchedImage);
    } else {
      runSearch(text);
    }
  };

  const clearSearch = () => {
    // Bump the counter so a search still in flight cannot bring results back.
    latestSearch.current++;
    setText('');
    setKeyword('');
    setSearchedImage(null);
    setKeywords([]);
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
        'Type a keyword to find posts by title or text, or tap the camera to search with a picture.',
      );
    }
    if (status === 'loading') {
      return (
        <View style={styles.centered}>
          {searchedImage && (
            <Image
              source={{ uri: searchedImage.uri }}
              style={styles.previewLarge}
              accessibilityLabel="The picture you are searching with"
            />
          )}
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.placeholderDetail}>
            {searchedImage ? 'Looking at your picture…' : 'Searching…'}
          </Text>
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
            onPress={retry}
            style={[ui.button, styles.retry]}
          >
            <Text style={ui.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    if (searchedImage && posts.length === 0) {
      return (
        <View style={styles.centered}>
          <Image
            source={{ uri: searchedImage.uri }}
            style={styles.previewLarge}
            accessibilityLabel="The picture you searched with"
          />
          <Text style={styles.placeholderTitle}>
            No posts match your picture
          </Text>
          <Text style={styles.placeholderDetail}>
            {keywords.length > 0
              ? `We looked for: ${keywords.join(', ')}`
              : 'We could not tell what the picture shows. Try a clearer one.'}
          </Text>
        </View>
      );
    }
    if (posts.length === 0) {
      return renderPlaceholder(
        `No results for “${keyword}”`,
        'Check the spelling or try a different keyword.',
      );
    }
    const countText = `${posts.length} ${
      posts.length === 1 ? 'result' : 'results'
    }`;
    return (
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          searchedImage ? (
            <View style={styles.imageHeader}>
              <Image
                source={{ uri: searchedImage.uri }}
                style={styles.previewSmall}
                accessibilityLabel="The picture you searched with"
              />
              <View style={ui.flex}>
                <Text style={styles.imageHeaderTitle}>
                  {countText} for your picture
                </Text>
                <Text style={styles.imageHeaderDetail}>
                  Found: {keywords.join(', ')}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.count}>
              {countText} for “{keyword}”
            </Text>
          )
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
          onImageSearch={() => setChoosingImage((open) => !open)}
        />
      </View>

      {choosingImage && (
        <View style={styles.imageChoices}>
          <Text style={styles.imageChoicesTitle}>Search with a picture</Text>
          <View style={styles.imageChoiceRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => pickImage('camera')}
              style={styles.imageChoice}
            >
              <PostIcon name="camera" size={20} />
              <Text style={styles.imageChoiceText}>Take a photo</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => pickImage('library')}
              style={styles.imageChoice}
            >
              <PostIcon name="image" size={20} />
              <Text style={styles.imageChoiceText}>Choose a picture</Text>
            </Pressable>
          </View>
        </View>
      )}

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
  imageChoices: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  imageChoicesTitle: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  imageChoiceRow: { flexDirection: 'row', gap: 10 },
  imageChoice: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
  },
  imageChoiceText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imageHeaderTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  imageHeaderDetail: { color: colors.muted, fontSize: 13, marginTop: 2 },
  previewSmall: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.soft,
  },
  previewLarge: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: colors.soft,
  },
});
