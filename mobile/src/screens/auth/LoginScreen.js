import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginVal.trim() || !password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre gerekli');
      return;
    }
    setLoading(true);
    try {
      await login(loginVal.trim(), password);
    } catch (e) {
      Alert.alert('Giriş başarısız', e.response?.data?.error || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🐾</Text>
          <LinearGradient
            colors={[COLORS.primary, COLORS.sand]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>PetCircle</Text>
          </LinearGradient>
          <Text style={styles.subtitle}>Evcil hayvan dostlarının sosyal ağı</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Giriş Yap</Text>

          <View style={styles.field}>
            <Text style={styles.label}>KULLANICI ADI / E-POSTA</Text>
            <TextInput
              style={styles.input}
              value={loginVal}
              onChangeText={setLoginVal}
              placeholder="kullaniciadi veya email"
              placeholderTextColor={COLORS.text3}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ŞİFRE</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.text3}
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary2]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Giriş Yap</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>🎯 Demo hesap</Text>
            <TouchableOpacity onPress={() => { setLoginVal('zeynep_kedi'); setPassword('demo1234'); }}>
              <Text style={styles.demoFill}>zeynep_kedi / demo1234 →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.switch}>
          <Text style={styles.switchText}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switchLink}>Kayıt ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logoEmoji: { fontSize: 52, marginBottom: 12 },
  logoGradient: { borderRadius: RADIUS.full, paddingHorizontal: 24, paddingVertical: 8, marginBottom: 8 },
  logoText: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.text3 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 22, letterSpacing: -0.3 },
  field: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.text3, letterSpacing: 0.5, marginBottom: 7 },
  input: {
    backgroundColor: COLORS.bg2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.text,
  },
  btn: {
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  demoBox: {
    marginTop: 18,
    padding: 14,
    backgroundColor: COLORS.bg2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border2,
  },
  demoTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text3, marginBottom: 6 },
  demoFill: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  switch: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { fontSize: 14, color: COLORS.text2 },
  switchLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
});
