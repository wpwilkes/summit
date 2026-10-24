import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostIcon from './PostIcon';
import { colors, ui } from './postsTheme';

export type PostsDestinationName = 'popular' | 'news';

export default function PostsSidebar({
  visible,
  onClose,
  onNavigate,
  onLogout,
  loggingOut,
}: {
  visible: boolean;
  onClose: () => void;
  onNavigate: (destination: PostsDestinationName) => void;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sidebar"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.drawer}>
          <Pressable
            accessibilityRole="button"
            disabled={loggingOut}
            onPress={() => onNavigate('popular')}
            style={styles.item}
          >
            <PostIcon name="popular" color={colors.muted} />
            <Text style={styles.label}>Popular</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={loggingOut}
            onPress={() => onNavigate('news')}
            style={styles.item}
          >
            <PostIcon name="news" color={colors.muted} />
            <Text style={styles.label}>News</Text>
          </Pressable>
          <View style={ui.separator} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log out"
            accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
            disabled={loggingOut}
            onPress={() => {
              onClose();
              onLogout();
            }}
            style={styles.item}
          >
            <PostIcon name="logout" color={colors.muted} />
            <Text style={styles.label}>
              {loggingOut ? 'Logging out…' : 'Log out'}
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
  drawer: {
    flex: 1,
    width: '82%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    boxShadow: '4px 0px 24px rgba(0,0,0,0.07)',
  },
  item: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 22,
  },
  label: { color: colors.text, fontSize: 18 },
});
