import { Stack } from 'expo-router';

/** Public resources sit above the existing Summit application. */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="resources/about"
        options={{ title: 'About Summit' }}
      />
      <Stack.Screen
        name="resources/rules"
        options={{ title: 'Summit Rules' }}
      />
      <Stack.Screen
        name="resources/user-agreement"
        options={{ title: 'User Agreement' }}
      />
      <Stack.Screen
        name="resources/careers"
        options={{ title: 'Careers at Summit' }}
      />
    </Stack>
  );
}
