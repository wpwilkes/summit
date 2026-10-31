import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { PostInput } from '../../types/summitPost.types';
import CommunityPicker from './CommunityPicker';
import PostIcon from './PostIcon';
import { colors, ui } from './postsTheme';

type Props = {
  initialValue?: PostInput;
  onSubmit: (input: PostInput) => void | Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
};

const emptyPost: PostInput = { body: '', community: '' };

export default function PostEditor({
  initialValue,
  onSubmit,
  onCancel,
  disabled = false,
}: Props) {
  const [draft, setDraft] = useState<PostInput>(initialValue ?? emptyPost);
  const [error, setError] = useState('');
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const update = (fields: Partial<PostInput>) => {
    setDraft((current) => ({ ...current, ...fields }));
    setError('');
  };
  const canSubmit =
    !disabled &&
    !picking &&
    !saving &&
    !!draft.community &&
    (!!draft.body.trim() || !!draft.photo);

  const pickPhoto = async () => {
    if (picking || disabled) return;
    setPicking(true);
    setError('');
    try {
      // SDK 57's system image picker needs no broad photo-library permission.
      // Only the single image the user selects is returned to this screen.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        allowsEditing: false,
        quality: 0.85,
      });
      if (mounted.current && !result.canceled) {
        const asset = result.assets[0];
        if (
          !asset ||
          (asset.mimeType && !asset.mimeType.startsWith('image/'))
        ) {
          throw new Error(
            'Choose a photo. Videos and documents are not supported.',
          );
        }
        update({
          photo: {
            uri: asset.uri,
            width: asset.width || 1,
            height: asset.height || 1,
            mimeType: asset.mimeType ?? undefined,
          },
        });
      }
    } catch (cause) {
      if (mounted.current)
        setError(
          cause instanceof Error
            ? cause.message
            : 'Unable to open your photos. Please try again.',
        );
    } finally {
      if (mounted.current) setPicking(false);
    }
  };

  const submit = async () => {
    if (submitting.current || !canSubmit) return;
    submitting.current = true;
    setSaving(true);
    try {
      await onSubmit(draft);
      Keyboard.dismiss();
    } catch (cause) {
      if (mounted.current) setError(
        cause instanceof Error ? cause.message : 'Unable to save your post.',
      );
    } finally {
      submitting.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={ui.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[ui.constrained, styles.header]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close composer"
          onPress={onCancel}
          style={ui.iconButton}
        >
          <PostIcon name="close" />
        </Pressable>
        <CommunityPicker
          value={draft.community}
          onChange={(community) => update({ community })}
          disabled={disabled || picking}
        />
        <View style={ui.flex} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={initialValue ? 'Save post' : 'Publish post'}
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          onPress={submit}
          style={[styles.publish, !canSubmit && styles.inactive]}
        >
          <Text style={[ui.buttonText, !canSubmit && styles.inactiveText]}>
            {initialValue ? 'Save' : 'Post'}
          </Text>
        </Pressable>
      </View>
      <ScrollView
        style={ui.flex}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[ui.constrained, styles.content]}
      >
        <TextInput
          accessibilityLabel="Post text"
          placeholder="Write your post…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={draft.body}
          onChangeText={(body) => update({ body })}
          multiline
          textAlignVertical="top"
          maxLength={10000}
          editable={!disabled}
          autoFocus
        />
        {draft.photo && (
          <View style={styles.photoContainer}>
            <Image
              accessibilityLabel="Selected photo"
              source={{ uri: draft.photo.uri }}
              resizeMode="contain"
              style={[
                styles.photo,
                {
                  aspectRatio: Math.min(
                    1.8,
                    Math.max(0.7, draft.photo.width / draft.photo.height),
                  ),
                },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              disabled={disabled || picking}
              onPress={() => update({ photo: undefined })}
              style={styles.remove}
            >
              <PostIcon name="close" color="white" size={19} />
            </Pressable>
          </View>
        )}
        {!!error && (
          <Text accessibilityRole="alert" style={ui.error}>
            {error}
          </Text>
        )}
      </ScrollView>
      <View style={[ui.constrained, styles.toolbar]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={draft.photo ? 'Change photo' : 'Add photo'}
          accessibilityState={{ disabled: disabled || picking }}
          disabled={disabled || picking}
          onPress={pickPhoto}
          style={styles.photoButton}
        >
          {picking ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <PostIcon name="image" />
          )}
          <Text style={ui.label}>
            {draft.photo ? 'Change photo' : 'Add photo'}
          </Text>
        </Pressable>
        <Text style={ui.muted}>
          {draft.body.length.toLocaleString()}/10,000
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 6 },
  publish: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 24,
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  inactive: { backgroundColor: '#f0f1f2' },
  inactiveText: { color: '#adb2b4' },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 16,
  },
  input: {
    fontSize: 21,
    lineHeight: 30,
    color: colors.text,
    minHeight: 160,
    padding: 0,
    outlineWidth: 0,
  },
  photoContainer: { position: 'relative' },
  photo: { width: '100%', backgroundColor: colors.soft, borderRadius: 18 },
  remove: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: 10,
  },
});
