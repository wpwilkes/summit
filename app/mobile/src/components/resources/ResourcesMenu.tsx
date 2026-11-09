import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RESOURCE_PAGES } from '../../data/resources';
import PostIcon from '../posts/PostIcon';

export default function ResourcesMenu({
  onClose,
  dark = false,
  disabled = false,
}: {
  onClose: () => void;
  dark?: boolean;
  disabled?: boolean;
}) {
  const color = dark ? '#dddddd' : '#202124';
  return (
    <View style={styles.section}>
      <Text
        accessibilityRole="header"
        style={[styles.heading, dark && styles.darkHeading]}
      >
        RESOURCES
      </Text>
      {RESOURCE_PAGES.map((page) => (
        <Pressable
          key={page.id}
          accessibilityRole="button"
          accessibilityLabel={page.label}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => {
            onClose();
            router.push(page.href);
          }}
          style={({ pressed }) => [
            styles.item,
            pressed && { backgroundColor: dark ? '#303034' : '#f2f4f5' },
          ]}
        >
          <PostIcon name={page.icon} color={color} size={23} />
          <Text style={[styles.label, { color }]}>{page.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingVertical: 12 },
  heading: {
    color: '#626c72',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.4,
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  darkHeading: { color: '#a6a6ac' },
  item: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  label: { flex: 1, fontSize: 16 },
});
