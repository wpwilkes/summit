import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  RecentCommunity,
} from '../../services/recentCommunitiesService';

import PostIcon from './PostIcon';

import {
  colors,
  ui,
} from './postsTheme';

type Props = {
  visible: boolean;

  onClose: () => void;

  onPopularPress: () => void;

  onNewsPress: () => void;

  onDiscoverCommunitiesPress: () => void;

  onStartCommunityPress: () => void;

  recentCommunities: RecentCommunity[];

  onRecentCommunityPress: (
    community: RecentCommunity,
  ) => void;

  onLogout: () => void;

  loggingOut: boolean;
};

export default function PostsSidebar({
  visible,
  onClose,
  onPopularPress,
  onNewsPress,
  onDiscoverCommunitiesPress,
  onStartCommunityPress,
  recentCommunities,
  onRecentCommunityPress,
  onLogout,
  loggingOut,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sidebar"
          onPress={onClose}
          style={
            StyleSheet.absoluteFill
          }
        />

        <SafeAreaView
          style={styles.drawer}
        >
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
          >
            <Pressable
              accessibilityRole="button"
              disabled={loggingOut}
              onPress={onPopularPress}
              style={styles.item}
            >
              <PostIcon
                name="popular"
                color={colors.muted}
              />

              <Text
                style={styles.label}
              >
                Popular
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={loggingOut}
              onPress={onNewsPress}
              style={styles.item}
            >
              <PostIcon
                name="news"
                color={colors.muted}
              />

              <Text
                style={styles.label}
              >
                News
              </Text>
            </Pressable>

            <View
              style={ui.separator}
            />

            <Pressable
              accessibilityRole="button"
              disabled={loggingOut}
              onPress={
                onDiscoverCommunitiesPress
              }
              style={styles.item}
            >
              <PostIcon
                name="discover"
                color={colors.muted}
              />

              <Text
                style={styles.label}
              >
                Discover Communities
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={loggingOut}
              onPress={
                onStartCommunityPress
              }
              style={styles.item}
            >
              <PostIcon
                name="plus"
                color={colors.muted}
              />

              <Text
                style={styles.label}
              >
                Start a Community
              </Text>
            </Pressable>

            <View
              style={ui.separator}
            />

            <View
              style={
                styles.sectionHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Recently Visited
              </Text>
            </View>

            {recentCommunities.length >
            0 ? (
              recentCommunities.map(
                (community) => (
                  <Pressable
                    key={
                      community.id
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${community.name}`}
                    disabled={
                      loggingOut
                    }
                    onPress={() =>
                      onRecentCommunityPress(
                        community,
                      )
                    }
                    style={
                      styles.communityItem
                    }
                  >
                    <View
                      style={
                        styles.communityAvatar
                      }
                    >
                      <Text
                        style={
                          styles.communityAvatarText
                        }
                      >
                        {community.name
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <Text
                      numberOfLines={1}
                      style={
                        styles.communityName
                      }
                    >
                      s/{community.name}
                    </Text>
                  </Pressable>
                ),
              )
            ) : (
              <Text
                style={
                  styles.emptySection
                }
              >
                No communities visited
                yet.
              </Text>
            )}

            <View
              style={ui.separator}
            />

            <View
              style={
                styles.sectionHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Your Communities
              </Text>
            </View>

            <Text
              style={
                styles.emptySection
              }
            >
              No communities joined
              yet.
            </Text>

            <View
              style={ui.separator}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log out"
              accessibilityState={{
                disabled: loggingOut,
                busy: loggingOut,
              }}
              disabled={loggingOut}
              onPress={() => {
                onClose();
                onLogout();
              }}
              style={styles.item}
            >
              <PostIcon
                name="logout"
                color={colors.muted}
              />

              <Text
                style={styles.label}
              >
                {loggingOut
                  ? 'Logging out…'
                  : 'Log out'}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:
      'rgba(255,255,255,0.6)',
  },

  drawer: {
    flex: 1,
    width: '82%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor:
      colors.border,
    boxShadow:
      '4px 0px 24px rgba(0,0,0,0.07)',
  },

  item: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 22,
  },

  label: {
    color: colors.text,
    fontSize: 18,
  },

  sectionHeader: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 8,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  communityItem: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 22,
  },

  communityAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      '#e8eaed',
  },

  communityAvatarText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  communityName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },

  emptySection: {
    color: colors.muted,
    fontSize: 14,
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 18,
  },
});
