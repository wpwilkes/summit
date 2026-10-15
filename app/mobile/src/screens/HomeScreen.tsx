import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { RootStackParamList } from '../types/navigation.types';
import { removeAuthToken } from '../utils/tokenStorage';
import { postsHtml } from '../generated/postsHtml';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Keep the source stable across renders so local demo posts are not reset.
const postsSource = { html: postsHtml };

export default function HomeScreen({ navigation }: Props) {
  const webView = useRef<WebView>(null);
  const logoutPending = useRef(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (logoutPending.current) return;
    logoutPending.current = true;
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      await removeAuthToken();

      // Reuse Khan's existing navigation stack and login screen.
      // Reset removes Posts from history, including the Android Back button.
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch {
      setLogoutError('Unable to log out. Please try again.');
      webView.current?.injectJavaScript(
        "window.dispatchEvent(new Event('summit:logout-error')); true;",
      );
    } finally {
      logoutPending.current = false;
      setIsLoggingOut(false);
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === 'summit:logout') {
      void handleLogout();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {loadFailed ? (
        <View style={styles.fallback}>
          <Text style={styles.message}>Unable to open Posts.</Text>
          {logoutError ? <Text style={styles.message}>{logoutError}</Text> : null}
          <Pressable
            accessibilityRole="button"
            style={styles.button}
            onPress={() => setLoadFailed(false)}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoggingOut }}
            style={styles.button}
            disabled={isLoggingOut}
            onPress={() => void handleLogout()}
          >
            <Text style={styles.buttonText}>
              {isLoggingOut ? 'Logging out…' : 'Log out'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          ref={webView}
          style={styles.webView}
          originWhitelist={['*']}
          source={postsSource}
          onMessage={handleMessage}
          onError={() => setLoadFailed(true)}
          onContentProcessDidTerminate={() => setLoadFailed(true)}
          onRenderProcessGone={() => setLoadFailed(true)}
          onShouldStartLoadWithRequest={({ url }) =>
            url === 'about:blank' || url.startsWith('about:blank#')
          }
          startInLoadingState
          renderLoading={() => (
            <View style={styles.fallback}>
              <ActivityIndicator size="large" color="#cf551d" />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f0f10' },
  webView: { flex: 1, backgroundColor: '#f5f6f8' },
  fallback: {
    flex: 1,
    backgroundColor: '#f5f6f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  message: { color: '#172033', fontSize: 16, textAlign: 'center' },
  button: {
    backgroundColor: '#cf551d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
