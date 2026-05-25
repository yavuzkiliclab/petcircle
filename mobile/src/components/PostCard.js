import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW } from '../theme';
import Avatar from './Avatar';
import client from '../api/client';

const W = Dimensions.get('window').width;

export default function PostCard({ post, onPress, onProfilePress }) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(l => !l);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      await client.post(`/posts/${post.id}/like`);
    } catch {
      setLiked(wasLiked);
      setLikeCount(post.like_count);
    }
  };

  const petEmoji = post.pet_type === 'cat' ? '🐱' : post.pet_type === 'dog' ? '🐶' : '🐾';
  const relTime = formatRelTime(post.created_at);

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={onProfilePress} activeOpacity={0.7}>
        <Avatar user={{ username: post.username, avatar_url: post.avatar_url }} size={38} />
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{post.username}</Text>
          <View style={styles.meta}>
            {post.pet_name ? <Text style={styles.metaText}>{petEmoji} {post.pet_name}</Text> : null}
            {post.location ? <Text style={styles.metaLocation}> · 📍{post.location}</Text> : null}
          </View>
        </View>
        <Text style={styles.time}>{relTime}</Text>
      </TouchableOpacity>

      {/* Image */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.95} onLongPress={handleLike}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: post.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
          {post.media_type === 'video' && (
            <View style={styles.videoBadge}>
              <Ionicons name="play-circle" size={42} color="rgba(255,255,255,0.9)" />
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.7}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? COLORS.danger : COLORS.text2}
          />
          <Text style={[styles.actionCount, liked && { color: COLORS.danger }]}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={22} color={COLORS.text2} />
          <Text style={styles.actionCount}>{post.comment_count || 0}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={22} color={COLORS.text2} />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {post.caption ? (
        <View style={styles.captionWrap}>
          <Text style={styles.caption}>
            <Text style={styles.captionUser}>{post.username} </Text>
            {post.caption}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function formatRelTime(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)}d`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}s`;
  return `${Math.floor(diff / 86400)}g`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  headerInfo: { flex: 1 },
  username: { fontSize: 13.5, fontWeight: '700', color: COLORS.text },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  metaText: { fontSize: 11.5, color: COLORS.text3 },
  metaLocation: { fontSize: 11.5, color: COLORS.teal },
  time: { fontSize: 11.5, color: COLORS.text3 },
  imageWrap: { width: W, height: W, backgroundColor: COLORS.bg2 },
  image: { width: '100%', height: '100%' },
  videoBadge: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 4,
    marginRight: 8,
  },
  actionCount: { fontSize: 13, fontWeight: '600', color: COLORS.text2 },
  captionWrap: { paddingHorizontal: 14, paddingBottom: 12, paddingTop: 2 },
  caption: { fontSize: 13.5, color: COLORS.text, lineHeight: 19 },
  captionUser: { fontWeight: '700' },
});
