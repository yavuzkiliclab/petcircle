import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function Avatar({ user, size = 40 }) {
  const initial = (user?.username || user?.full_name || '?')[0].toUpperCase();

  if (user?.avatar_url) {
    return (
      <View style={[styles.ring, { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 }]}>
        <Image
          source={{ uri: user.avatar_url }}
          style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: COLORS.bg }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.ring, { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 }]}>
      <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{initial}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    padding: 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: COLORS.primary2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  initial: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
