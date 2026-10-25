import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
} from '../posts/postsTheme';

type Props = {
  name: string;
  description: string;
  memberCount: string;

  joined: boolean;

  onJoinPress: () => void;

  onPress?: () => void;
};

export default function CommunityCard({
  name,
  description,
  memberCount,
  joined,
  onJoinPress,
  onPress,
}: Props) {
  const firstLetter =
    name.charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole={
          onPress
            ? 'button'
            : undefined
        }
        accessibilityLabel={
          onPress
            ? `Open ${name}`
            : undefined
        }
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [
          styles.communityInfo,
          pressed &&
            onPress &&
            styles.pressed,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {firstLetter}
          </Text>
        </View>

        <View style={styles.details}>
          <Text
            numberOfLines={1}
            style={styles.name}
          >
            s/{name}
          </Text>

          <Text style={styles.members}>
            {memberCount}
          </Text>

          <Text
            numberOfLines={2}
            style={styles.description}
          >
            {description}
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          joined
            ? `Leave ${name}`
            : `Join ${name}`
        }
        onPress={onJoinPress}
        style={({ pressed }) => [
          styles.joinButton,
          joined &&
            styles.joinedButton,
          pressed &&
            styles.pressed,
        ]}
      >
        <Text
          style={[
            styles.joinButtonText,
            joined &&
              styles.joinedButtonText,
          ]}
        >
          {joined
            ? 'Joined'
            : 'Join'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor:
      colors.border,
  },

  communityInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      '#e8eaed',
  },

  avatarText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },

  details: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },

  members: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
  },

  description: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },

  joinButton: {
    minWidth: 70,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      '#ff4500',
  },

  joinedButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor:
      colors.border,
  },

  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  joinedButtonText: {
    color: colors.text,
  },

  pressed: {
    opacity: 0.7,
  },
});