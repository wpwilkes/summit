import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { getAuthToken, removeAuthToken } from '../utils/tokenStorage';
import { colors } from '../components/posts/postsTheme';
import SummitPostsScreen from './SummitPostsScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

/** Keep Khan's existing Home route and replace only its temporary content. */
export default function HomeScreen({ navigation }: Props) {
  const [ready, setReady] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const logoutPending = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    let active = true;
    mounted.current = true;
    // Confirm the local session before mounting Posts. This is not server validation.
    getAuthToken().then((token) => {
      if (!active) return;
      if (token) setReady(true);
      else navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    }).catch(() => {
      if (active) navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    });
    return () => { active = false; mounted.current = false; };
  }, [navigation]);

  const handleLogout = async () => {
    if (logoutPending.current) return;
    logoutPending.current = true;
    setLoggingOut(true);
    setLogoutError('');
    try {
      // Await SecureStore deletion before reporting a successful logout.
      await removeAuthToken();
      if (!mounted.current) return;
      setReady(false);
      // Reset removes the signed-in screen and its in-memory posts/drafts.
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {
      if (mounted.current) setLogoutError('Unable to log out. Please try again.');
    } finally {
      logoutPending.current = false;
      if (mounted.current) setLoggingOut(false);
    }
  };

  if (!ready) return <View style={styles.loading}><ActivityIndicator color={colors.accent} size="large" /></View>;
  return <SummitPostsScreen onLogout={handleLogout} loggingOut={loggingOut} logoutError={logoutError} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
});
