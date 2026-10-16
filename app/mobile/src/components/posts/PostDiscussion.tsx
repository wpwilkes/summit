import { useState } from 'react';
import {
  Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SummitPostsService } from '../../services/summitPostsService';
import type { SummitPost } from '../../types/summitPost.types';
import PostEditor from './PostEditor';
import { colors, ui } from './postsTheme';

type Props = {
  post: SummitPost;
  service: SummitPostsService;
  startEditing: boolean;
  onChange: () => void;
  onClose: () => void;
};

export default function PostDiscussion({ post, service, startEditing, onChange, onClose }: Props) {
  const [editing, setEditing] = useState(startEditing);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const comments = service.comments(post.id);
  const addComment = () => {
    try {
      service.comment(post.id, body);
      setBody('');
      setError('');
      Keyboard.dismiss();
      onChange();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to add your comment.');
    }
  };
  const deletePost = () => {
    try {
      service.remove(post.id);
      onClose();
      onChange();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete your post.');
    }
  };
  return (
    <Modal visible animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={ui.title}>Post discussion</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close post" onPress={onClose} style={[ui.button, ui.secondary]}>
            <Text style={ui.secondaryText}>Close</Text>
          </Pressable>
        </View>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <View style={ui.card}>
              <Text style={styles.category}>{post.category} · Posted by {post.author}</Text>
              <Text selectable style={ui.title}>{post.title}</Text>
              <Text selectable style={ui.body}>{post.description}</Text>
              <Text style={ui.muted}>{post.voteCount} votes · {post.commentCount} comments</Text>
              {post.isOwner && !editing && <View style={ui.row}>
                <Pressable accessibilityRole="button" onPress={() => { setEditing(true); setConfirmDelete(false); }} style={[ui.button, ui.secondary]}>
                  <Text style={ui.secondaryText}>Edit post</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => setConfirmDelete(true)} style={[ui.button, ui.secondary]}>
                  <Text style={ui.error}>Delete post</Text>
                </Pressable>
              </View>}
            </View>
            {confirmDelete && <View style={ui.card}>
              <Text style={ui.label}>Delete this post and its comments?</Text>
              <View style={ui.row}>
                <Pressable accessibilityRole="button" onPress={deletePost} style={ui.button}>
                  <Text style={ui.buttonText}>Confirm delete</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => setConfirmDelete(false)} style={[ui.button, ui.secondary]}>
                  <Text style={ui.secondaryText}>Keep post</Text>
                </Pressable>
              </View>
            </View>}
            {editing && post.isOwner && <PostEditor initialValue={post}
              onCancel={() => setEditing(false)}
              onSubmit={(input) => { service.update(post.id, input); setEditing(false); onChange(); }} />}
            <View style={ui.card}>
              <Text style={ui.title}>Comments</Text>
              <TextInput style={[ui.input, styles.commentInput]} accessibilityLabel="Comment"
                placeholder="Add a comment..." placeholderTextColor={colors.muted}
                multiline textAlignVertical="top" value={body} onChangeText={(value) => { setBody(value); setError(''); }}
                maxLength={2000} />
              {!!error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>}
              <Pressable accessibilityRole="button" onPress={addComment} style={ui.button}>
                <Text style={ui.buttonText}>Submit comment</Text>
              </Pressable>
              {!comments.length && <Text style={ui.muted}>No comments yet.</Text>}
              {comments.map((comment) => <View key={comment.id} style={styles.comment}>
                <Text style={ui.label}>{comment.author}</Text>
                <Text selectable style={ui.body}>{comment.body}</Text>
              </View>)}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  content: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingBottom: 40, gap: 16 },
  category: { color: colors.accent, fontSize: 13, lineHeight: 20 },
  commentInput: { minHeight: 90, maxHeight: 180 },
  comment: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 4 },
});
