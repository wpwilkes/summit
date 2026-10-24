import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostIcon from './PostIcon';
import { colors, ui } from './postsTheme';

export default function ItemActionsMenu({
  subject,
  onEdit,
  onDelete,
  disabled = false,
}: {
  subject: 'post' | 'comment';
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const close = () => {
    setOpen(false);
    setConfirm(false);
  };
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${subject === 'post' ? 'Post' : 'Comment'} options`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={ui.iconButton}
      >
        <PostIcon name="more" size={21} color={colors.muted} />
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close options"
            style={StyleSheet.absoluteFill}
            onPress={close}
          />
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <View style={styles.handle} />
            {confirm ? (
              <>
                <Text style={ui.title}>Delete this {subject}?</Text>
                <Text style={ui.muted}>
                  {subject === 'post'
                    ? 'Its comments will also be deleted.'
                    : 'This comment will be removed.'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    close();
                    onDelete();
                  }}
                  style={styles.item}
                >
                  <PostIcon name="trash" color={colors.error} />
                  <Text style={[ui.label, { color: colors.error }]}>
                    Confirm delete
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={close}
                  style={styles.item}
                >
                  <Text style={ui.label}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    close();
                    onEdit();
                  }}
                  style={styles.item}
                >
                  <PostIcon name="edit" />
                  <Text style={ui.label}>Edit {subject}</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setConfirm(true)}
                  style={styles.item}
                >
                  <PostIcon name="trash" color={colors.error} />
                  <Text style={[ui.label, { color: colors.error }]}>
                    Delete {subject}
                  </Text>
                </Pressable>
              </>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  sheet: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 10,
  },
  item: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 8,
  },
});
