import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Vote } from '../../types/summitPost.types';
import PostIcon from './PostIcon';
import { colors, formatCount } from './postsTheme';

export default function VoteControls({
  count,
  vote,
  onVote,
  disabled = false,
  compact = false,
  subject = 'post',
}: {
  count: number;
  vote: Vote;
  onVote: (value: -1 | 1) => void;
  disabled?: boolean;
  compact?: boolean;
  subject?: string;
}) {
  const selectedColor =
    vote === 1 ? colors.accent : vote === -1 ? colors.downvote : colors.text;
  return (
    <View style={[styles.group, compact && styles.compact]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Upvote ${subject}`}
        accessibilityState={{ selected: vote === 1, disabled }}
        disabled={disabled}
        onPress={() => onVote(1)}
        style={styles.arrow}
      >
        <PostIcon
          name="up"
          size={21}
          color={vote === 1 ? colors.accent : colors.muted}
          filled={vote === 1}
        />
      </Pressable>
      <Text
        accessibilityLabel={`${count} ${subject} votes`}
        accessibilityLiveRegion="polite"
        style={[styles.count, { color: selectedColor }]}
      >
        {formatCount(count)}
      </Text>
      {!compact && <View style={styles.divider} />}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Downvote ${subject}`}
        accessibilityState={{ selected: vote === -1, disabled }}
        disabled={disabled}
        onPress={() => onVote(-1)}
        style={styles.arrow}
      >
        <PostIcon
          name="down"
          size={21}
          color={vote === -1 ? colors.downvote : colors.muted}
          filled={vote === -1}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    minHeight: 42,
  },
  compact: { borderWidth: 0 },
  arrow: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { fontWeight: '600', fontSize: 14, minWidth: 12, textAlign: 'center' },
  divider: {
    width: 1,
    height: 19,
    backgroundColor: colors.border,
    marginLeft: 10,
  },
});
