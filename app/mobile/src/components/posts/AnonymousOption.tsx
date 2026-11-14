import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, ui } from './postsTheme';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export default function AnonymousOption({ value, onChange, disabled = false }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[ui.label, styles.label]}>Post anonymously</Text>
        <Switch
          accessibilityLabel="Post anonymously"
          accessibilityHint="Hide your username from other users on this post or comment."
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>
      <Text style={styles.note}>
        Your username will appear as Anonymous to other users. The server retains your identity for editing and moderation.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { flex: 1 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 17 },
});
