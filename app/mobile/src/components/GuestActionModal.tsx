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

export default function GuestActionModal({
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
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />

        <View style={styles.modalCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>+</Text>
          </View>

          <Text style={styles.title}>
            Log in to create a post
          </Text>

          <Text style={styles.message}>
            You can browse Summit without an account,
            but you need to log in before you can create
            or join a discussion.
          </Text>

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

          <Pressable
            style={styles.guestButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Continue as guest"
          >
            <Text style={styles.guestButtonText}>
              Continue as Guest
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    paddingHorizontal: 24,
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#333337',
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
    alignItems: 'center',
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2a271e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  iconText: {
    color: '#e7c86e',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '500',
  },

  title: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  message: {
    color: '#999999',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
  },

  loginButton: {
    width: '100%',
    backgroundColor: '#e7c86e',
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },

  loginButtonText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
  },

  signupButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e7c86e',
    borderRadius: 6,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 8,
  },

  signupButtonText: {
    color: '#e7c86e',
    fontSize: 14,
    fontWeight: '700',
  },

  guestButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  guestButtonText: {
    color: '#aaaaaa',
    fontSize: 13,
    fontWeight: '600',
  },
});