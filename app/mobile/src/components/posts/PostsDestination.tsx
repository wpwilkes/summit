import { Pressable, StyleSheet, Text, View } from 'react-native';
import PostIcon from './PostIcon';
import type { PostsDestinationName } from './PostsSidebar';
import { colors, ui } from './postsTheme';

/**
 * Handoff to the teammate implementing Popular/News.
 * Navigation and Back already work. Replace only this view's content (or
 * delegate to their screen); don't reuse the guest feed or modify login routes.
 */
export default function PostsDestination({
  destination,
  onBack,
}: {
  destination: PostsDestinationName;
  onBack: () => void;
}) {
  const label = destination === 'popular' ? 'Popular' : 'News';
  return (
    <View style={[ui.flex, ui.constrained]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to posts"
          onPress={onBack}
          style={ui.iconButton}
        >
          <PostIcon name="back" />
        </Pressable>
        <Text style={ui.title}>{label}</Text>
      </View>
      <View style={styles.empty}>
        <PostIcon name={destination} size={40} color={colors.muted} />
        <Text style={ui.title}>Nothing here yet</Text>
        <Text style={ui.muted}>
          Check back for {label.toLowerCase()} posts.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
});
