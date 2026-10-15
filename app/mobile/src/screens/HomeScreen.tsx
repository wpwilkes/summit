import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types/navigation.types';
import { removeAuthToken } from '../utils/tokenStorage';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen({
  navigation,
}: Props) {
  const handleLogout = async () => {
    await removeAuthToken();

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Welcome',
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>S</Text>
        </View>

        <Text style={styles.title}>
          Summit
        </Text>

        <Text style={styles.subtitle}>
          You are signed in.
        </Text>

        <Text style={styles.description}>
          This is a temporary authenticated screen
          for testing login, session storage, and
          logout.
        </Text>

        <Pressable
          style={styles.button}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>
            Log Out
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f10',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  logoBox: {
    width: 50,
    height: 50,
    backgroundColor: '#e7c86e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  logoText: {
    color: '#111111',
    fontSize: 24,
    fontWeight: 'bold',
  },

  title: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#e7c86e',
    fontSize: 18,
    marginTop: 10,
  },

  description: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
  },

  button: {
    width: '100%',
    backgroundColor: '#e7c86e',
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: 'center',
  },

  buttonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '700',
  },
});
