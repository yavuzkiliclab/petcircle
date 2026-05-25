import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../theme';

const PET_TYPES = [
  { value: 'cat', label: '🐱 Kedi' },
  { value: 'dog', label: '🐶 Köpek' },
  { value: 'other', label: '🐾 Diğer' },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', pet_name: '', pet_type: 'other' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password || !form.full_name) {
      Alert.alert('Hata', 'Tüm alanlar zorunludur');
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (e) {
      Alert.alert('Kayıt başarısız', e.response?.data?.error || 'Bir hata oluştu');
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
        <View style={styles.header}>
          <Text style={styles.emoji}>🌿</Text>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>PetCircle'a katıl</Text>
        </View>

        <View style={styles.card}>
          {[
            { key: 'username', label: 'KULLANICI ADI', placeholder: 'orman_kedisi', autoCapitalize: 'none' },
            { key: 'email', label: 'E-POSTA', placeholder: 'ornek@email.com', autoCapitalize: 'none', keyboardType: 'email-address' },
            { key: 'password', label: 'ŞİFRE', placeholder: '••••••••', secure: true },
            { key: 'full_name', label: 'AD SOYAD', placeholder: 'Ayşe Yıldız' },
            { key: 'pet_name', label: 'EVCİL HAYVAN ADI', placeholder: 'Pamuk (opsiyonel)' },
          ].map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={form[f.key]}
                onChangeText={v => set(f.key, v)}
                placeholder={f.placeholder}
                placeholderTextColor={COLORS.text3}
                secureTextEntry={f.secure}
                autoCapitalize={f.autoCapitalize || 'words'}
                keyboardType={f.keyboardType || 'default'}
              />
            </View>
          ))}

          <Text style={styles.label}>EVCİL HAYVAN TÜRÜ</Text>
          <View style={styles.petRow}>
            {PET_TYPES.map(p => (
              <TouchableOpacity
                key={p.value}
                style={[styles.petBtn, form.pet_type === p.value && styles.petBtnActive]}
                onPress={() => set('pet_type', p.value)}
              >
                <Text style={[styles.petBtnText, form.pet_type === p.value && styles.petBtnTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85} style={{ marginTop: 8 }}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary2]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Kayıt Ol</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.switch}>
          <Text style={styles.switchText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchLink}>Giriş yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 50, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28 },
  emoji: { fontSize: 44, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: COLORS.text3, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
  field: { marginBottom: 14 },
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
  petRow: { flexDirection: 'row', gap: 8, marginBottom: 18, marginTop: 7 },
  petBtn: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.bg2, alignItems: 'center',
  },
  petBtnActive: {
    backgroundColor: 'rgba(45,106,79,0.1)',
    borderColor: COLORS.primary,
  },
  petBtnText: { fontSize: 13, color: COLORS.text2, fontWeight: '500' },
  petBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
  btn: { borderRadius: RADIUS.md, paddingVertical: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  switch: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { fontSize: 14, color: COLORS.text2 },
  switchLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
});
