import { useState, useEffect, useCallback } from 'react';
import {
  View, FlatList, RefreshControl, StyleSheet, Text,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS } from '../theme';

const FILTERS = [
  { label: 'Tümü', value: 'all' },
  { label: '🐱 Kedi', value: 'cat' },
  { label: '🐶 Köpek', value: 'dog' },
];

export default function FeedScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchPosts(1, true);
    fetchSuggestions();
  }, [filter]);

  const fetchPosts = async (p = 1, reset = false) => {
    try {
      const r = await client.get(`/posts/feed?page=${p}&pet_type=${filter}`);
      setPosts(prev => reset ? r.data.posts : [...prev, ...r.data.posts]);
      setHasMore(r.data.hasMore);
      setPage(p);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const r = await client.get('/users/suggestions?limit=5');
      setSuggestions(r.data || []);
    } catch {}
  };

  const onRefresh = () => { setRefreshing(true); fetchPosts(1, true); };
  const onEndReached = () => { if (hasMore && !loading) fetchPosts(page + 1); };

  const header = (
    <View>
      {/* Stories row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stories} contentContainerStyle={{ paddingHorizontal: 12, gap: 12, paddingVertical: 8 }}>
        <TouchableOpacity style={styles.storyNew} onPress={() => navigation.navigate('NewPost')}>
          <LinearGradient colors={[COLORS.bg3, COLORS.bg2]} style={styles.storyInner}>
            <Ionicons name="add" size={22} color={COLORS.primary} />
          </LinearGradient>
          <Text style={styles.storyLabel}>Paylaş</Text>
        </TouchableOpacity>
        {suggestions.slice(0, 8).map(u => (
          <TouchableOpacity key={u.id} style={styles.storyItem} onPress={() => navigation.navigate('Profile', { username: u.username })}>
            <LinearGradient colors={[COLORS.primary, COLORS.sand]} style={styles.storyRing}>
              <Avatar user={u} size={52} />
            </LinearGradient>
            <Text style={styles.storyLabel} numberOfLines={1}>{u.username}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.pill, filter === f.value && styles.pillActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.pillText, filter === f.value && styles.pillTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading && posts.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <FlatList
        data={posts}
        keyExtractor={p => String(p.id)}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            onProfilePress={() => navigation.navigate('Profile', { username: item.username })}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌿</Text>
            <Text style={styles.emptyText}>Henüz gönderi yok</Text>
          </View>
        }
        ListFooterComponent={hasMore ? <ActivityIndicator color={COLORS.primary} style={{ padding: 20 }} /> : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  stories: { borderBottomWidth: 1, borderBottomColor: COLORS.border2, backgroundColor: COLORS.card },
  storyNew: { alignItems: 'center', gap: 5 },
  storyItem: { alignItems: 'center', gap: 5 },
  storyRing: { borderRadius: 30, padding: 2 },
  storyInner: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  storyLabel: { fontSize: 10.5, color: COLORS.text2, maxWidth: 58, textAlign: 'center' },
  filters: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border2 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
  },
  pillActive: { backgroundColor: 'rgba(45,106,79,0.1)', borderColor: COLORS.primary },
  pillText: { fontSize: 13, fontWeight: '500', color: COLORS.text2 },
  pillTextActive: { color: COLORS.primary, fontWeight: '700' },
  empty: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.text3 },
});
