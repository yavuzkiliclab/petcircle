import { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { COLORS, RADIUS } from '../theme';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const r = await client.get(`/posts/${postId}`);
      setPost(r.data);
      setLiked(r.data.is_liked);
      setLikeCount(r.data.like_count || 0);
    } catch {}
  };

  const fetchComments = async () => {
    try {
      const r = await client.get(`/posts/${postId}/comments`);
      setComments(r.data);
    } catch {}
  };

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(l => !l);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    try {
      await client.post(`/posts/${postId}/like`);
    } catch {
      setLiked(wasLiked);
      setLikeCount(post.like_count);
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const r = await client.post(`/posts/${postId}/comments`, { content: comment.trim() });
      setComments(prev => [r.data, ...prev]);
      setComment('');
    } catch {} finally { setSubmitting(false); }
  };

  if (!post) {
    return <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Post header */}
        <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('Profile', { username: post.username })}>
          <Avatar user={{ username: post.username, avatar_url: post.avatar_url }} size={38} />
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{post.username}</Text>
            {post.location ? <Text style={styles.location}>📍 {post.location}</Text> : null}
          </View>
        </TouchableOpacity>

        {/* Image */}
        <Image source={{ uri: post.image_url }} style={styles.image} resizeMode="cover" />

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? COLORS.danger : COLORS.text2} />
            <Text style={[styles.actionCount, liked && { color: COLORS.danger }]}>{likeCount}</Text>
          </TouchableOpacity>
          <View style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={24} color={COLORS.text2} />
            <Text style={styles.actionCount}>{comments.length}</Text>
          </View>
        </View>

        {/* Caption */}
        {post.caption ? (
          <View style={styles.captionWrap}>
            <Text style={styles.caption}><Text style={styles.captionUser}>{post.username} </Text>{post.caption}</Text>
          </View>
        ) : null}

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Yorumlar</Text>
          {comments.map(c => (
            <View key={c.id} style={styles.commentItem}>
              <Avatar user={{ username: c.username, avatar_url: c.avatar_url }} size={32} />
              <View style={styles.commentBody}>
                <Text style={styles.commentText}>
                  <Text style={styles.commentUser}>{c.username} </Text>
                  {c.content}
                </Text>
                <Text style={styles.commentTime}>{formatRelTime(c.created_at)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Comment input */}
      <View style={styles.inputRow}>
        <Avatar user={user} size={32} />
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="Yorum ekle..."
          placeholderTextColor={COLORS.text3}
          returnKeyType="send"
          onSubmitEditing={handleComment}
        />
        <TouchableOpacity onPress={handleComment} disabled={!comment.trim() || submitting}>
          <Ionicons name="send" size={22} color={comment.trim() ? COLORS.primary : COLORS.text3} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatRelTime(d) {
  if (!d) return '';
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return 'az önce';
  if (diff < 3600) return `${Math.floor(diff/60)}d`;
  if (diff < 86400) return `${Math.floor(diff/3600)}s`;
  return `${Math.floor(diff/86400)}g`;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, backgroundColor: COLORS.card },
  username: { fontSize: 13.5, fontWeight: '700', color: COLORS.text },
  location: { fontSize: 11.5, color: COLORS.teal, marginTop: 1 },
  image: { width: '100%', aspectRatio: 1, backgroundColor: COLORS.bg2 },
  actions: { flexDirection: 'row', gap: 4, padding: 12, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border2 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 10 },
  actionCount: { fontSize: 14, fontWeight: '600', color: COLORS.text2 },
  captionWrap: { padding: 14, backgroundColor: COLORS.card },
  caption: { fontSize: 13.5, color: COLORS.text, lineHeight: 19 },
  captionUser: { fontWeight: '700' },
  commentsSection: { padding: 14, backgroundColor: COLORS.card, marginTop: 8, gap: 14 },
  commentsTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text2, marginBottom: 4 },
  commentItem: { flexDirection: 'row', gap: 10 },
  commentBody: { flex: 1 },
  commentText: { fontSize: 13.5, color: COLORS.text, lineHeight: 18 },
  commentUser: { fontWeight: '700' },
  commentTime: { fontSize: 11, color: COLORS.text3, marginTop: 2 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, backgroundColor: COLORS.card,
    borderTopWidth: 1, borderTopColor: COLORS.border2,
  },
  input: {
    flex: 1, backgroundColor: COLORS.bg2, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 9, fontSize: 13.5, color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border,
  },
});
