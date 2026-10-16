import { useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { PostInput } from '../../types/summitPost.types';
import CategoryPicker from './CategoryPicker';
import { colors, ui } from './postsTheme';

type Props = {
  initialValue?: PostInput;
  onSubmit: (input: PostInput) => void;
  onCancel?: () => void;
  disabled?: boolean;
};

const emptyPost: PostInput = { title: '', description: '', category: 'Technology', anonymous: false };

export default function PostEditor({ initialValue, onSubmit, onCancel, disabled = false }: Props) {
  const [draft, setDraft] = useState<PostInput>(initialValue ?? emptyPost);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const update = (fields: Partial<PostInput>) => {
    setDraft((current) => ({ ...current, ...fields }));
    setError('');
  };
  const submit = () => {
    if (submitting.current || disabled) return;
    submitting.current = true;
    try {
      onSubmit(draft);
      setError('');
      if (!initialValue) setDraft({ ...emptyPost });
      Keyboard.dismiss();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save your post.');
    } finally {
      submitting.current = false;
    }
  };
  return (
    <View style={ui.card}>
      <Text style={ui.label}>{initialValue ? 'Edit your post' : 'Start a discussion'}</Text>
      <TextInput style={ui.input} accessibilityLabel={initialValue ? 'Edit post title' : 'Post title'}
        placeholder="Post title" placeholderTextColor={colors.muted} value={draft.title}
        onChangeText={(title) => update({ title })} maxLength={160} editable={!disabled} />
      <TextInput style={[ui.input, styles.content]} accessibilityLabel={initialValue ? 'Edit post content' : 'Post content'}
        placeholder="What do you want to discuss?" placeholderTextColor={colors.muted}
        value={draft.description} onChangeText={(description) => update({ description })}
        multiline textAlignVertical="top" maxLength={10000} editable={!disabled} />
      <Text style={ui.muted}>Category</Text>
      <CategoryPicker value={draft.category} onChange={(category) => update({ category })}
        label={initialValue ? 'Edit category' : 'Post category'} disabled={disabled} />
      <View style={ui.between}>
        <Text style={ui.label}>Post anonymously</Text>
        <Switch accessibilityLabel="Post anonymously" value={draft.anonymous}
          onValueChange={(anonymous) => update({ anonymous })} disabled={disabled}
          trackColor={{ false: colors.border, true: colors.accent }} />
      </View>
      {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>}
      <View style={ui.row}>
        <Pressable accessibilityRole="button" onPress={submit} disabled={disabled}
          accessibilityState={{ disabled }} style={[ui.button, disabled && ui.disabled]}>
          <Text style={ui.buttonText}>{initialValue ? 'Save changes' : 'Publish post'}</Text>
        </Pressable>
        {onCancel && <Pressable accessibilityRole="button" onPress={onCancel} style={[ui.button, ui.secondary]}>
          <Text style={ui.secondaryText}>Cancel edit</Text>
        </Pressable>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ content: { minHeight: 110, maxHeight: 240 } });
