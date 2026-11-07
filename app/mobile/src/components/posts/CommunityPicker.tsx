import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Community } from '@summit/shared';
import { getCommunities } from '../../services/communityService';
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
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    let active = true;

    const loadCommunities = async () => {
      setLoading(true);
      setError('');

      const result = await getCommunities();

      if (!active) return;

      if (!result.success) {
        setCommunities([]);
        setError(result.message);
        setLoading(false);
        return;
      }

      setCommunities(result.communities);
      setLoading(false);
    };

    loadCommunities();

    return () => {
      active = false;
    };
  }, [open]);

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

          {loading ? (
            <View style={styles.statusContainer}>
              <ActivityIndicator color={colors.accent} />
              <Text style={ui.muted}>Loading communities...</Text>
            </View>
          ) : error ? (
            <View style={styles.statusContainer}>
              <Text accessibilityRole="alert" style={ui.error}>
                {error}
              </Text>
            </View>
          ) : communities.length === 0 ? (
            <View style={styles.statusContainer}>
              <Text style={ui.muted}>No communities are available yet.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={ui.constrained}>
              {communities.map((community) => (
                <Pressable
                  key={community.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose s/${community.name}`}
                  accessibilityState={{
                    selected: community.name === value,
                  }}
                  onPress={() => {
                    onChange(community.name);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    community.name === value && styles.selected,
                  ]}
                >
                  <View style={styles.symbol}>
                    <Text style={styles.symbolText}>s/</Text>
                  </View>
                  <Text style={ui.label}>s/{community.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
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
  statusContainer: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
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
  symbolText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted,
  },
});