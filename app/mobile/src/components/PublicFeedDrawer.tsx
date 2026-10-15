import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
};

export default function PublicFeedDrawer({
  visible,
  onClose,
  onLogin,
  onSignup,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Tap outside the drawer to close it */}

        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        />

        <View style={styles.drawer}>
          {/* Drawer Header */}

          <View style={styles.drawerHeader}>
            <View style={styles.brandContainer}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>
                  S
                </Text>
              </View>

              <Text style={styles.brandName}>
                Summit
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <Text style={styles.closeButtonText}>
                ×
              </Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Navigation */}

          <Text style={styles.sectionLabel}>
            EXPLORE
          </Text>

          <Pressable
            style={styles.menuItem}
            onPress={onClose}
          >
            <Text style={styles.menuItemText}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={onClose}
          >
            <Text style={styles.menuItemText}>
              Topics
            </Text>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={onClose}
          >
            <Text style={styles.menuItemText}>
              About Summit
            </Text>
          </Pressable>

          <View style={styles.divider} />

          {/* Reply Digest Tones */}

          <Text style={styles.sectionLabel}>
            REPLY DIGEST TONES
          </Text>

          <View style={styles.toneRow}>
            <Text style={styles.consensusDot}>
              ●
            </Text>

            <Text style={styles.consensusText}>
              Broad consensus
            </Text>
          </View>

          <View style={styles.toneRow}>
            <Text style={styles.dividedDot}>
              ●
            </Text>

            <Text style={styles.dividedText}>
              Divided opinions
            </Text>
          </View>

          <View style={styles.toneRow}>
            <Text style={styles.informativeDot}>
              ●
            </Text>

            <Text style={styles.informativeText}>
              Informative thread
            </Text>
          </View>

          <View style={styles.toneRow}>
            <Text style={styles.lightHeartedDot}>
              ●
            </Text>

            <Text style={styles.lightHeartedText}>
              Light-hearted
            </Text>
          </View>

          <View style={styles.spacer} />

          <View style={styles.divider} />

          {/* Authentication */}

          <Pressable
            style={styles.loginButton}
            onPress={onLogin}
            accessibilityRole="button"
          >
            <Text style={styles.loginButtonText}>
              Log In
            </Text>
          </Pressable>

          <Pressable
            style={styles.signupButton}
            onPress={onSignup}
            accessibilityRole="button"
          >
            <Text style={styles.signupButtonText}>
              Create Account
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  drawer: {
    width: '82%',
    maxWidth: 330,
    height: '100%',
    backgroundColor: '#151517',
    borderRightWidth: 1,
    borderRightColor: '#303034',
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBox: {
    width: 38,
    height: 38,
    backgroundColor: '#e7c86e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  logoText: {
    color: '#111111',
    fontSize: 20,
    fontWeight: 'bold',
  },

  brandName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
  },

  closeButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    color: '#bbbbbb',
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '300',
  },

  divider: {
    height: 1,
    backgroundColor: '#2b2b2f',
    marginVertical: 20,
  },

  sectionLabel: {
    color: '#777777',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  menuItem: {
    paddingVertical: 13,
  },

  menuItemText: {
    color: '#dddddd',
    fontSize: 16,
    fontWeight: '500',
  },

  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },

  consensusDot: {
    color: '#20d99a',
    marginRight: 9,
  },

  consensusText: {
    color: '#20d99a',
    fontSize: 14,
  },

  dividedDot: {
    color: '#f0b91c',
    marginRight: 9,
  },

  dividedText: {
    color: '#f0b91c',
    fontSize: 14,
  },

  informativeDot: {
    color: '#25b9ef',
    marginRight: 9,
  },

  informativeText: {
    color: '#25b9ef',
    fontSize: 14,
  },

  lightHeartedDot: {
    color: '#a875ff',
    marginRight: 9,
  },

  lightHeartedText: {
    color: '#a875ff',
    fontSize: 14,
  },

  spacer: {
    flex: 1,
  },

  loginButton: {
    borderWidth: 1,
    borderColor: '#e7c86e',
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },

  loginButtonText: {
    color: '#e7c86e',
    fontSize: 15,
    fontWeight: '700',
  },

  signupButton: {
    backgroundColor: '#e7c86e',
    paddingVertical: 13,
    alignItems: 'center',
  },

  signupButtonText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
  },
});