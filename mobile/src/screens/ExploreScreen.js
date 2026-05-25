import { useState, useEffect } from 'react';
import {
  View, FlatList, Image, TouchableOpacity, StyleSheet,
  Dimensions, Text, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import { COLORS, RADIUS } from '../theme';

const W = Dimensions.get('window').width;
const ITEM = (W - 4) / 3;

export default function ExploreScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => { fetchPosts(1, true); }, [filter]);

  const fetchPosts = async (p = 1, reset = false) => {
    try {
      const r = await client.get(`/posts/explore?page=${p}&pet_type=${filter}`);
      setPosts(prev => reset ? r.data.posts : [...prev, ...r.data.posts]);
      setHasMore(r.data.hasMore);
      setPage(p);
    } finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (query.trim()) {
      navigation.navigate('Search', { q: query.trim() });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={17} color={COLORS.text3} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder="Ara..."
          placeholderTextColor={COLORS.text3}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.text3} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {[
          { label: 'Tümü', value: 'all' },
          { label: '🐱', value: 'cat' },
          { label: '🐶', value: 'dog' },
        ].map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.pill, filter === f.value && styles.pillActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.pillText, filter === f.value && styles.pillTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && posts.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={p => String(p.id)}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              activeOpacity={0.9}
            >
              <Image source={{ uri: item.image_url }} style={styles.itemImg} />
              {item.media_type === 'video' && (
                <View style={styles.videoIcon}>
                  <Ionicons name="play" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>
          )}
          onEndReached={() => { if (hasMore) fetchPosts(page + 1); }}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
          columnWrapperStyle={{ gap: 2 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.card, marginHorizontal: 12, marginVertical: 10,
    borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  filters: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 10,
  },
  pill: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card,
  },
  pillActive: { backgroundColor: 'rgba(45,106,79,0.1)', borderColor: COLORS.primary },
  pillText: { fontSize: 13, color: COLORS.text2, fontWeight: '500' },
  pillTextActive: { color: COLORS.primary, fontWeight: '700' },
  item: { width: ITEM, height: ITEM, backgroundColor: COLORS.bg2 },
  itemImg: { width: '100%', height: '100%' },
  videoIcon: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4, padding: 3,
  },
});
