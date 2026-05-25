import { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '../components/Avatar';
import client from '../api/client';
import { COLORS } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

export default function ReelsScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef(null);

  useEffect(() => { fetchPosts(1); }, []);

  const fetchPosts = async (p = 1) => {
    try {
      const r = await client.get(`/posts/explore?page=${p}&pet_type=all`);
      setPosts(prev => p === 1 ? r.data.posts : [...prev, ...r.data.posts]);
      setHasMore(r.data.hasMore);
      setPage(p);
    } finally { setLoading(false); }
  };

  const handleLike = async (postId, wasLiked) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, is_liked: !wasLiked, like_count: wasLiked ? p.like_count - 1 : p.like_count + 1 } : p
    ));
    try { await client.post(`/posts/${postId}/like`); } catch {}
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index ?? 0);
  }).current;

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <FlatList
        ref={flatRef}
        data={posts}
        keyExtractor={p => String(p.id)}
        renderItem={({ item, index }) => (
          <ReelItem
            post={item}
            isActive={index === currentIndex}
            onLike={() => handleLike(item.id, item.is_liked)}
            onProfile={() => navigation.navigate('Profile', { username: item.username })}
            onPost={() => navigation.navigate('PostDetail', { postId: item.id })}
          />
        )}
        pagingEnabled
        snapToInterval={H - 82}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        onEndReached={() => { if (hasMore) fetchPosts(page + 1); }}
        onEndReachedThreshold={0.3}
        getItemLayout={(_, i) => ({ length: H - 82, offset: (H - 82) * i, index: i })}
      />
    </View>
  );
}

function ReelItem({ post, isActive, onLike, onProfile, onPost }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);

  const handleLike = () => {
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    onLike();
  };

  return (
    <View style={styles.reel}>
      <Image source={{ uri: post.image_url }} style={styles.reelMedia} resizeMode="cover" />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.reelGrad}
      />

      {/* Bottom info */}
      <View style={styles.reelBottom}>
        <TouchableOpacity style={styles.reelUser} onPress={onProfile} activeOpacity={0.8}>
          <Avatar user={{ username: post.username, avatar_url: post.avatar_url }} size={36} />
          <Text style={styles.reelUsername}>@{post.username}</Text>
          <View style={styles.followPill}>
            <Text style={styles.followPillText}>Takip Et</Text>
          </View>
        </TouchableOpacity>
        {post.caption ? <Text style={styles.reelCaption} numberOfLines={2}>{post.caption}</Text> : null}
        {post.pet_name ? (
          <View style={styles.reelPet}>
            <Text style={styles.reelPetText}>🐾 {post.pet_name}</Text>
          </View>
        ) : null}
      </View>

      {/* Side actions */}
      <View style={styles.reelActions}>
        <TouchableOpacity style={styles.reelAction} onPress={handleLike} activeOpacity={0.8}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={30} color={liked ? COLORS.danger : 'white'} />
          <Text style={styles.reelActionCount}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reelAction} onPress={onPost} activeOpacity={0.8}>
          <Ionicons name="chatbubble-outline" size={28} color="white" />
          <Text style={styles.reelActionCount}>{post.comment_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reelAction} activeOpacity={0.8}>
          <Ionicons name="paper-plane-outline" size={28} color="white" />
          <Text style={styles.reelActionCount}>Paylaş</Text>
        </TouchableOpacity>
        <View style={styles.reelAvatarBtn}>
          <Image
            source={{ uri: post.avatar_url || `https://i.pravatar.cc/60?u=${post.username}` }}
            style={styles.reelAvatarImg}
          />
          <View style={styles.reelAvatarPlus}>
            <Ionicons name="add" size={12} color="white" />
          </View>
        </View>
      </View>
    </View>
  );
}

const { height: CHEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  reel: { width: W, height: CHEIGHT - 82, backgroundColor: '#111', overflow: 'hidden' },
  reelMedia: { position: 'absolute', width: '100%', height: '100%' },
  reelGrad: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%' },
  reelBottom: { position: 'absolute', left: 14, right: 70, bottom: 24 },
  reelUser: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reelUsername: { fontSize: 14, fontWeight: '700', color: 'white', textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  followPill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  followPillText: { fontSize: 11, fontWeight: '600', color: 'white' },
  reelCaption: { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 18, marginBottom: 8 },
  reelPet: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  reelPetText: { fontSize: 12, color: 'white' },
  reelActions: { position: 'absolute', right: 10, bottom: 24, gap: 20, alignItems: 'center' },
  reelAction: { alignItems: 'center', gap: 4 },
  reelActionCount: { fontSize: 11.5, fontWeight: '700', color: 'white', textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  reelAvatarBtn: { position: 'relative', marginTop: 4 },
  reelAvatarImg: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: 'white' },
  reelAvatarPlus: { position: 'absolute', bottom: -6, left: '50%', marginLeft: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'white' },
});
