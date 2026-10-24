import { Text, View } from 'react-native';

const palette = [
  ['#dce9ff', '#2458bf'],
  ['#d9fce7', '#19683e'],
  ['#fce4f1', '#a32360'],
  ['#eee2ff', '#6940a5'],
  ['#ffe7d1', '#a34b13'],
  ['#d6f5f5', '#12696c'],
] as const;

export default function UserAvatar({
  username,
  size = 36,
}: {
  username: string;
  size?: number;
}) {
  const name = username.trim().replace(/^u\//i, '') || '?';
  // A repeatable color prevents avatars from changing on every render/vote.
  const hash = Array.from(name).reduce(
    (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  const [backgroundColor, color] = palette[hash % palette.length];
  return (
    <View
      accessibilityLabel={`${name} profile picture`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color, fontSize: size * 0.46, fontWeight: '600' }}>
        {Array.from(name)[0].toUpperCase()}
      </Text>
    </View>
  );
}
