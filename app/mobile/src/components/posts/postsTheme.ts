import { StyleSheet } from 'react-native';

export const colors = {
  background: '#ffffff',
  surface: '#ffffff',
  soft: '#f4f5f6',
  border: '#e2e4e5',
  text: '#0f1416',
  muted: '#5c696e',
  accent: '#ff4500',
  onAccent: '#ffffff',
  downvote: '#6a5cff',
  error: '#b3261e',
};

export const ui = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: colors.background },
  constrained: { width: '100%', maxWidth: 900, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  label: { color: colors.text, fontSize: 15, fontWeight: '600' },
  body: { color: colors.text, fontSize: 17, lineHeight: 24 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  error: { color: colors.error, fontSize: 14, lineHeight: 21 },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.onAccent, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  separator: { height: 1, backgroundColor: colors.border },
});

export function relativeTime(timestamp: string): string {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(timestamp)) / 60000),
  );
  if (!Number.isFinite(minutes) || minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
}

export function formatCount(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
