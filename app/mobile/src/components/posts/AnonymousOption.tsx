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
        <Text style={[ui.label, styles.label]}>Show as Anonymous on this device</Text>
        <Switch
          accessibilityLabel="Show as Anonymous on this device"
          accessibilityHint="Changes the name beside your posts and comments on this device only. Other users and AI summaries may still show your username."
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{ false: colors.border, true: colors.accent }}
        />
      </View>
      <Text style={styles.note}>
        Only changes the name beside your posts and comments on this device. Other users, other screens and AI summaries may still show your username.
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
