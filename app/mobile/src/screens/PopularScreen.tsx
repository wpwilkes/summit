import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import PostIcon from '../components/posts/PostIcon';
import {
  colors,
  ui,
} from '../components/posts/postsTheme';
import type { RootStackParamList } from '../types/navigation.types';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Popular'
>;

export default function PopularScreen({
  navigation,
}: Props) {
  return (
    <SafeAreaView style={ui.page}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          style={ui.iconButton}
        >
          <PostIcon name="back" />
        </Pressable>

        <Text style={ui.title}>
          Popular
        </Text>
      </View>

      <View style={styles.content}>
        <PostIcon
          name="popular"
          size={42}
          color={colors.muted}
        />

        <Text style={ui.title}>
          Popular
        </Text>

        <Text style={ui.muted}>
          Popular posts will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
});