import { Pressable, StyleSheet, Text, View } from 'react-native';
import PostIcon, { RedditLogo } from './PostIcon';
import { colors, ui } from './postsTheme';

export default function PostsHeader({
  onMenu,
  onCreate,
  onSearch,
  disabled = false,
}: {
  onMenu: () => void;
  onCreate: () => void;
  onSearch: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.border}>
      <View style={[ui.constrained, styles.header]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open sidebar"
          onPress={onMenu}
          style={[ui.iconButton, styles.round]}
        >
          <PostIcon name="menu" />
        </Pressable>
        {/* Tapping the search box opens the full Search screen. */}
        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Search Summit"
          onPress={onSearch}
          style={styles.search}
        >
          <RedditLogo />
          <Text numberOfLines={1} style={styles.placeholder}>
            Search Summit
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create post"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onCreate}
          style={[ui.iconButton, styles.round, disabled && ui.disabled]}
        >
          <PostIcon name="plus" size={28} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 9,
  },
  round: {
    backgroundColor: '#fff',
    boxShadow: '0px 2px 18px rgba(0,0,0,0.04)',
  },
  search: {
    flex: 1,
    minWidth: 0,
    height: 47,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#c8cbcd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 7,
    paddingRight: 16,
  },
  placeholder: {
    flex: 1,
    color: colors.muted,
    fontSize: 17,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
});
