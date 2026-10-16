import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { POST_CATEGORIES } from '../../services/summitPostsService';
import { colors } from './postsTheme';

type Props = {
  value: string;
  onChange: (category: string) => void;
  includeAll?: boolean;
  disabled?: boolean;
  label: string;
};

export default function CategoryPicker({ value, onChange, includeAll = false, disabled = false, label }: Props) {
  const categories = includeAll ? ['', ...POST_CATEGORIES] : POST_CATEGORIES;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.options}>
      {categories.map((category) => (
        <Pressable key={category || 'all'} accessibilityRole="button"
          accessibilityLabel={`${label}: ${category || 'Home feed'}`}
          accessibilityState={{ selected: value === category, disabled }}
          disabled={disabled} onPress={() => onChange(category)}
          style={[styles.chip, value === category && styles.selected]}>
          <Text style={[styles.text, value === category && styles.selectedText]}>
            {category || 'Home feed'}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  options: { gap: 8, paddingVertical: 4 },
  chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  selectedText: { color: colors.onAccent },
});
