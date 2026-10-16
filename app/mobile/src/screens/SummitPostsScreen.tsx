import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryPicker from '../components/posts/CategoryPicker';
import PostDiscussion from '../components/posts/PostDiscussion';
import PostEditor from '../components/posts/PostEditor';
import SummitPostCard from '../components/posts/SummitPostCard';
import { colors, ui } from '../components/posts/postsTheme';
import { createSummitPostsService } from '../services/summitPostsService';

type Props = { onLogout: () => void; loggingOut: boolean; logoutError: string };

export default function SummitPostsScreen({ onLogout, loggingOut, logoutError }: Props) {
  const [service] = useState(() => createSummitPostsService());
  const [category, setCategory] = useState('');
  const [revision, setRevision] = useState(0);
  const [detail, setDetail] = useState<{ id: string; editing: boolean } | null>(null);
  const [error, setError] = useState('');
  const refresh = () => setRevision((value) => value + 1);
  const posts = service.list(category);
  const selectedPost = detail ? service.get(detail.id) : null;
  const header = (
    <View style={styles.listHeader}>
      <View style={ui.card}>
        <Text style={ui.label}>Demo workspace</Text>
        <Text style={ui.muted}>Posts, comments, and votes are temporary. They reset when you reload the app or log out.</Text>
      </View>
      <CategoryPicker label="Filter" includeAll value={category} disabled={loggingOut}
        onChange={(value) => { setCategory(value); setError(''); }} />
      <View style={ui.between}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>SUMMIT COMMUNITY</Text>
          <Text style={styles.feedTitle}>{category || 'Home feed'}</Text>
        </View>
        <Text style={ui.muted}>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</Text>
      </View>
      <PostEditor disabled={loggingOut} onSubmit={(input) => {
        service.create(input);
        if (category) setCategory(input.category);
        setError('');
        refresh();
      }} />
      {!!error && <Text style={ui.error} accessibilityRole="alert">{error}</Text>}
    </View>
  );
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}><Text style={styles.logoText}>S</Text></View>
          <View><Text style={styles.brandName}>summit</Text><Text style={ui.muted}>Your posts</Text></View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Log out"
          accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
          disabled={loggingOut} onPress={onLogout} style={[ui.button, loggingOut && ui.disabled]}>
          <Text style={ui.buttonText}>{loggingOut ? 'Logging out…' : 'Log out'}</Text>
        </Pressable>
      </View>
      {!!logoutError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[ui.error, styles.logoutError]}>{logoutError}</Text>}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList data={posts} extraData={revision} keyExtractor={(post) => post.id}
          ListHeaderComponent={header}
          renderItem={({ item }) => <SummitPostCard post={item} disabled={loggingOut}
            onOpen={() => setDetail({ id: item.id, editing: false })}
            onEdit={() => setDetail({ id: item.id, editing: true })}
            onVote={(value) => {
              try { service.vote(item.id, value); refresh(); setError(''); }
              catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to vote.'); }
            }} />}
          ItemSeparatorComponent={PostSeparator}
          ListEmptyComponent={<View style={[ui.card, styles.empty]}>
            <Text style={ui.label}>No posts yet</Text>
            <Text style={ui.muted}>{category ? `Start a discussion in ${category}.` : 'Publish the first one.'}</Text>
          </View>}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" />
      </KeyboardAvoidingView>
      {detail && selectedPost && <PostDiscussion key={detail.id} post={selectedPost} service={service}
        startEditing={detail.editing} onClose={() => setDetail(null)} onChange={refresh} />}
    </SafeAreaView>
  );
}

function PostSeparator() { return <View style={styles.separator} />; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { width: '100%', maxWidth: 1000, alignSelf: 'center', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  logo: { width: 40, height: 40, borderRadius: 6, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 22, fontWeight: '800', color: colors.onAccent },
  brandName: { color: colors.text, fontSize: 23, fontWeight: '700' },
  list: { width: '100%', maxWidth: 1000, alignSelf: 'center', padding: 16, paddingBottom: 40 },
  listHeader: { gap: 16, paddingBottom: 16 },
  heading: { flexShrink: 1, gap: 4 },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  feedTitle: { color: colors.text, fontSize: 27, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 32 },
  separator: { height: 14 },
  logoutError: { paddingHorizontal: 16, paddingTop: 12 },
});
