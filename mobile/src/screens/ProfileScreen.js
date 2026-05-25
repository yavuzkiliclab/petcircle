import { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, FlatList,
  Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '../components/Avatar';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../theme';

const W = Dimensions.get('window').width;
const ITEM = (W - 3) / 3;

export default function ProfileScreen({ route, navigation }) {
  const { user: me, logout } = useAuth();
  const username = route.params?.username || me?.username;
  const isMe = me?.username === username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const r = await client.get(`/users/${username}`);
      setProfile(r.data);
    } catch {
      navigation.goBack();
    } finally { setLoading(false); }
  };

  const fetchPosts = async () => {
    try {
      const r = await client.get(`/users/${username}/posts`);
      setPosts(r.data.posts || []);
    } catch {}
  };

  const handleFollow = async () => {
    try {
      const r = await client.post(`/users/${username}/follow`);
      setProfile(p => ({ ...p, is_following: r.data.is_following, follower_count: r.data.follower_count }));
    } catch {}
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
  }
  if (!profile) return null;

  const petIcon = profile.pet_type === 'cat' ? '🐱' : profile.pet_type === 'dog' ? '🐶' : '🐾';

  const header = (
    <View>
      {/* Avatar + stats row */}
      <LinearGradient colors={[COLORS.bg, COLORS.bg2]} style={styles.topSection}>
        <View style={styles.avatarRow}>
          <Avatar user={profile} size={78} />
          <View style={styles.stats}>
            <StatItem label="Gönderi" value={profile.post_count} />
            <StatItem label="Takipçi" value={profile.follower_count} />
            <StatItem label="Takip" value={profile.following_count} />
          </View>
        </View>

        <View style={styles.bioSection}>
          <Text style={styles.fullName}>{profile.full_name}</Text>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
          {profile.pet_name ? (
            <View style={styles.petBadge}>
              <Text style={styles.petBadgeText}>{petIcon} {profile.pet_name}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.btnRow}>
          {isMe ? (
            <>
              <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.editBtnText}>Profili Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Çıkış', 'Çıkmak istediğine emin misin?', [{ text: 'İptal' }, { text: 'Çıkış', style: 'destructive', onPress: logout }])}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.text3} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.followBtn, profile.is_following && styles.followingBtn]}
                onPress={handleFollow}
              >
                <Text style={[styles.followBtnText, profile.is_following && styles.followingBtnText]}>
                  {profile.is_following ? 'Takip Ediliyor' : 'Takip Et'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.msgBtn}
                onPress={() => navigation.navigate('Messages', { username })}
              >
                <Ionicons name="chatbubble-outline" size={17} color={COLORS.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>

      {/* Grid header */}
      <View style={styles.gridHeader}>
        <Ionicons name="grid-outline" size={22} color={COLORS.primary} />
        <Text style={styles.gridHeaderText}>Gönderiler</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <FlatList
        data={posts}
        keyExtractor={p => String(p.id)}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.image_url }} style={styles.gridImg} />
            {item.media_type === 'video' && (
              <View style={styles.videoIcon}>
                <Ionicons name="play" size={12} color="white" />
              </View>
            )}
          </TouchableOpacity>
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyText}>Henüz gönderi yok</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 1.5 }} />}
        columnWrapperStyle={{ gap: 1.5 }}
      />
    </View>
  );
}

function StatItem({ label, value }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statNum}>{value ?? 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  topSection: { padding: 16, paddingTop: 12 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 14 },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 2 },
  statNum: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 11.5, color: COLORS.text3 },
  bioSection: { marginBottom: 14 },
  fullName: { fontSize: 14.5, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  bio: { fontSize: 13.5, color: COLORS.text2, lineHeight: 19 },
  petBadge: {
    alignSelf: 'flex-start', marginTop: 8,
    backgroundColor: 'rgba(45,106,79,0.08)', borderWidth: 1, borderColor: 'rgba(45,106,79,0.2)',
    borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 4,
  },
  petBadgeText: { fontSize: 12.5, color: COLORS.primary, fontWeight: '500' },
  btnRow: { flexDirection: 'row', gap: 10 },
  editBtn: {
    flex: 1, paddingVertical: 9, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
    alignItems: 'center',
  },
  editBtnText: { fontSize: 13.5, fontWeight: '600', color: COLORS.text },
  logoutBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
  },
  followBtn: {
    flex: 1, paddingVertical: 10, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  followingBtn: { backgroundColor: COLORS.bg3, borderWidth: 1, borderColor: COLORS.border },
  followBtnText: { fontSize: 13.5, fontWeight: '700', color: '#fff' },
  followingBtnText: { color: COLORS.text2 },
  msgBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
    alignItems: 'center', justifyContent: 'center',
  },
  gridHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border2,
    backgroundColor: COLORS.card,
  },
  gridHeaderText: { fontSize: 13, fontWeight: '700', color: COLORS.text2 },
  gridItem: { width: ITEM, height: ITEM, backgroundColor: COLORS.bg2 },
  gridImg: { width: '100%', height: '100%' },
  videoIcon: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: 3,
  },
  empty: { padding: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, color: COLORS.text3 },
});
