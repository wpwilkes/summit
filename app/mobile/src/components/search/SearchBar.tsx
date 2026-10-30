import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import PostIcon from '../posts/PostIcon';
import { colors } from '../posts/postsTheme';
import { MAX_SEARCH_LENGTH } from '../../services/searchService';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** Called when the user taps the search button or the keyboard's search key. */
  onSubmit: () => void;
  /** Called when the user taps the X. The parent should empty `value`. */
  onClear: () => void;
  autoFocus?: boolean;
};

/**
 * The search box: a magnifier button, the text field, and an X to clear it.
 * The X only shows while there is something typed.
 */
export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  autoFocus = false,
}: Props) {
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search"
        onPress={onSubmit}
        hitSlop={8}
        style={styles.iconButton}
      >
        <PostIcon name="search" size={22} color={colors.muted} />
      </Pressable>
      <TextInput
        accessibilityLabel="Search text"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        maxLength={MAX_SEARCH_LENGTH}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="Search Summit"
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={onClear}
          hitSlop={8}
          style={styles.iconButton}
        >
          <PostIcon name="close" size={20} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#c8cbcd',
    backgroundColor: colors.soft,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 0,
  },
});
