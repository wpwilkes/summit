import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BackendSummitPostsService } from '../../services/backendSummitPostsService';
import type { PostSummary as PostSummaryData } from '../../types/summitPost.types';
import { colors, relativeTime, ui } from './postsTheme';

type Props = {
  postId: string;
  /** How many comments the post has right now. */
  commentCount: number;
  service: BackendSummitPostsService;
  disabled?: boolean;
};

// Summaries longer than this get a "Show more" button.
const COLLAPSED_LENGTH = 220;

/**
 * The AI summary box on the post detail page.
 * It shows the last saved summary, and the button writes a new one from the
 * post and comments as they are right now.
 */
export default function PostSummary({
  postId,
  commentCount,
  service,
  disabled = false,
}: Props) {
  const [summary, setSummary] = useState<PostSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  // When the post opens, load the summary that was saved earlier (if any).
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    service
      .summary(postId)
      .then((saved) => {
        if (active) setSummary(saved);
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof Error ? cause.message : 'Could not load summary.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [postId, service]);

  const generate = async () => {
    if (disabled || generating) return;
    setGenerating(true);
    setError('');
    try {
      setSummary(await service.generateSummary(postId));
      setExpanded(false);
    } catch (cause) {
      // Keep the old summary on screen, so a failed refresh loses nothing.
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not create a summary. Please try again.',
      );
    } finally {
      setGenerating(false);
    }
  };

  const isLong = !!summary && summary.text.length > COLLAPSED_LENGTH;
  const isOutdated = !!summary && summary.commentCount !== commentCount;

  return (
    <View style={styles.box}>
      <View style={ui.between}>
        <Text style={ui.label}>AI summary</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={summary ? 'Refresh summary' : 'Summarize post'}
          accessibilityState={{ disabled: disabled || generating || loading }}
          disabled={disabled || generating || loading}
          onPress={generate}
          style={[
            styles.button,
            (disabled || generating || loading) && ui.disabled,
          ]}
        >
          {generating ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={styles.buttonText}>
              {summary ? 'Refresh' : 'Summarize'}
            </Text>
          )}
        </Pressable>
      </View>

      {loading && <ActivityIndicator color={colors.accent} />}

      {generating && (
        <Text style={ui.muted}>Reading the post and comments…</Text>
      )}

      {!!summary && (
        <>
          <Text
            selectable
            numberOfLines={expanded || !isLong ? undefined : 4}
            style={styles.text}
          >
            {summary.text}
          </Text>
          {isLong && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpanded((open) => !open)}
            >
              <Text style={styles.toggle}>
                {expanded ? 'Show less' : 'Show more'}
              </Text>
            </Pressable>
          )}
          <Text style={ui.muted}>
            Based on {summary.commentCount}{' '}
            {summary.commentCount === 1 ? 'comment' : 'comments'} ·{' '}
            {relativeTime(summary.createdAt)}
          </Text>
          {isOutdated && !generating && (
            <Text style={styles.outdated}>
              The comments changed since this summary. Tap Refresh to update it.
            </Text>
          )}
        </>
      )}

      {!loading && !summary && !generating && !error && (
        <Text style={ui.muted}>
          Tap Summarize to get a short AI summary of this post and its
          comments.
        </Text>
      )}

      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 8,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
  },
  button: {
    minWidth: 92,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  text: { color: colors.text, fontSize: 15, lineHeight: 22 },
  toggle: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  outdated: { color: colors.muted, fontSize: 13, fontStyle: 'italic' },
});
