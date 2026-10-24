import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { POST_COMMUNITIES } from '../../services/summitPostsService';
import PostIcon from './PostIcon';
import { colors, ui } from './postsTheme';

export default function CommunityPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (community: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          value ? `Community: s/${value}` : 'Select community'
        }
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <Text numberOfLines={1} style={[ui.label, styles.name]}>
          {value ? `s/${value}` : 'Select community'}
        </Text>
        <PostIcon name="chevron" size={17} />
      </Pressable>
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={ui.page}>
          <View style={[ui.constrained, styles.header]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close communities"
              onPress={() => setOpen(false)}
              style={ui.iconButton}
            >
              <PostIcon name="close" />
            </Pressable>
            <Text style={ui.title}>Select community</Text>
          </View>
          <ScrollView contentContainerStyle={ui.constrained}>
            {POST_COMMUNITIES.map((community) => (
              <Pressable
                key={community}
                accessibilityRole="button"
                accessibilityLabel={`Choose s/${community}`}
                accessibilityState={{ selected: community === value }}
                onPress={() => {
                  onChange(community);
                  setOpen(false);
                }}
                style={[styles.option, community === value && styles.selected]}
              >
                <View style={styles.symbol}>
                  <Text style={styles.symbolText}>s/</Text>
                </View>
                <Text style={ui.label}>s/{community}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexShrink: 1,
    minHeight: 44,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    backgroundColor: colors.soft,
    borderRadius: 24,
    paddingHorizontal: 13,
  },
  name: { flexShrink: 1, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  option: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    gap: 14,
  },
  selected: { backgroundColor: colors.soft },
  symbol: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f2f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: { fontSize: 18, fontWeight: '700', color: colors.muted },
});
