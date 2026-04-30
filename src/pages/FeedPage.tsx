import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Send, ThumbsUp, MessageCircle, Trash2, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Post, Comment, Profile } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { PostSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

const PAGE_SIZE = 10;

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface PostCardProps {
  post: Post;
  onLike: (id: string, liked: boolean) => void;
  onDelete: (id: string) => void;
}

function PostCard({ post, onLike, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const loadComments = async () => {
    setLoadingComments(true);
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles(*)')
      .eq('post_id', post.id)
      .order('created_at');
    setComments((data as Comment[]) || []);
    setLoadingComments(false);
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(!showComments);
  };

  const submitComment = async () => {
    if (!newComment.trim() || !user) return;
    setPosting(true);
    const { data } = await supabase
      .from('comments')
      .insert({ post_id: post.id, author_id: user.id, content: newComment.trim() })
      .select('*, author:profiles(*)')
      .single();
    if (data) {
      setComments(c => [...c, data as Comment]);
      setNewComment('');
      if (post.author_id !== user.id) {
        await supabase.from('notifications').insert({
          recipient_id: post.author_id,
          sender_id: user.id,
          type: 'comment',
          title: 'New comment on your post',
          body: newComment.trim().slice(0, 80),
          reference_id: post.id,
        });
      }
    }
    setPosting(false);
  };

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <button onClick={() => navigate(`/profile/${post.author_id}`)}>
          <Avatar src={post.author?.avatar_url} name={post.author?.full_name} size="md" />
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/profile/${post.author_id}`)}
            className="font-semibold text-navy-900 text-sm hover:underline"
          >
            {post.author?.full_name || 'Unknown'}
          </button>
          <p className="text-xs text-gray-500 truncate">
            {post.author?.headline || post.author?.job_title || ''}
          </p>
          <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
        </div>
        {user?.id === post.author_id && (
          <button
            onClick={() => onDelete(post.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="post"
          className="w-full max-h-96 object-cover"
        />
      )}

      {/* Stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 text-xs text-gray-500">
        <span>{post.likes_count > 0 ? `${post.likes_count} like${post.likes_count !== 1 ? 's' : ''}` : ''}</span>
        <button onClick={toggleComments} className="hover:underline">
          {post.comments_count > 0 ? `${post.comments_count} comment${post.comments_count !== 1 ? 's' : ''}` : ''}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-1 px-3 py-1.5 border-t border-gray-100">
        <button
          onClick={() => onLike(post.id, !!post.liked_by_me)}
          className={`
            flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all
            ${post.liked_by_me
              ? 'text-royal-600 bg-royal-50'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }
          `}
        >
          <ThumbsUp size={16} className={post.liked_by_me ? 'fill-royal-500' : ''} />
          Like
        </button>
        <button
          onClick={toggleComments}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
        >
          <MessageCircle size={16} />
          Comment
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          {loadingComments ? (
            <div className="text-xs text-gray-400 text-center py-2">Loading comments...</div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <Avatar src={comment.author?.avatar_url} name={comment.author?.full_name} size="xs" />
                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold text-navy-900">{comment.author?.full_name}</p>
                  <p className="text-xs text-gray-700 mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))
          )}
          {/* Comment Input */}
          <div className="flex gap-2">
            <Avatar src={undefined} name={user?.email} size="xs" />
            <div className="flex-1 flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment()}
                placeholder="Write a comment..."
                className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:bg-white transition-all"
              />
              <button
                onClick={submitComment}
                disabled={posting || !newComment.trim()}
                className="p-2 text-navy-600 hover:bg-navy-50 rounded-full transition-colors disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function FeedPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImageUrl, setPostImageUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    loadPosts(true);

    const channel = supabase
      .channel('posts-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        loadPosts(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadPosts = async (reset = false) => {
    if (reset) {
      setLoading(true);
      offsetRef.current = 0;
    } else {
      setLoadingMore(true);
    }

    const offset = reset ? 0 : offsetRef.current;
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles(*)')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (data) {
      // Check which posts user liked
      let likedIds: Set<string> = new Set();
      if (user && data.length > 0) {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', data.map(p => p.id));
        likedIds = new Set((likes || []).map(l => l.post_id));
      }

      const enriched = data.map(p => ({ ...p, liked_by_me: likedIds.has(p.id) })) as Post[];

      if (reset) {
        setPosts(enriched);
      } else {
        setPosts(prev => [...prev, ...enriched]);
      }
      setHasMore(data.length === PAGE_SIZE);
      offsetRef.current = offset + data.length;
    }

    setLoading(false);
    setLoadingMore(false);
  };

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      setPosts(p => p.map(post => post.id === postId
        ? { ...post, likes_count: post.likes_count - 1, liked_by_me: false }
        : post
      ));
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      const post = posts.find(p => p.id === postId);
      if (post && post.author_id !== user.id) {
        await supabase.from('notifications').insert({
          recipient_id: post.author_id,
          sender_id: user.id,
          type: 'post_like',
          title: 'Someone liked your post',
          body: post.content.slice(0, 60),
          reference_id: postId,
        });
      }
      setPosts(p => p.map(post => post.id === postId
        ? { ...post, likes_count: post.likes_count + 1, liked_by_me: true }
        : post
      ));
    }
  };

  const handleDelete = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
    setPosts(p => p.filter(post => post.id !== postId));
    success('Post deleted');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImage(file);
      setPostImageUrl(URL.createObjectURL(file));
    }
  };

  const submitPost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);

    let imageUrl = '';
    if (postImage) {
      const ext = postImage.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      await supabase.storage.from('post-images').upload(path, postImage);
      const { data } = supabase.storage.from('post-images').getPublicUrl(path);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('posts').insert({
      author_id: user.id,
      content: newPost.trim(),
      image_url: imageUrl,
    });

    if (!error) {
      setNewPost('');
      setPostImage(null);
      setPostImageUrl('');
      await loadPosts(true);
    } else {
      toastError('Failed to post', error.message);
    }
    setPosting(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Create Post */}
        <Card>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/profile/${user?.id}`)}>
              <Avatar src={profile?.avatar_url} name={profile?.full_name} size="md" />
            </button>
            <div className="flex-1">
              <Textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="What's on your mind? Share an update..."
                rows={3}
                className="text-sm"
              />

              {postImageUrl && (
                <div className="relative mt-2 inline-block">
                  <img src={postImageUrl} alt="preview" className="max-h-40 rounded-lg object-cover" />
                  <button
                    onClick={() => { setPostImage(null); setPostImageUrl(''); }}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <div>
                  <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  <button
                    onClick={() => imageRef.current?.click()}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Image size={16} />
                    Photo
                  </button>
                </div>
                <Button
                  size="sm"
                  onClick={submitPost}
                  loading={posting}
                  disabled={!newPost.trim()}
                  icon={<Send size={14} />}
                  iconPosition="right"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts */}
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <Card className="text-center py-12">
            <MessageCircle size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-navy-900 mb-1">Your feed is empty</h3>
            <p className="text-sm text-gray-500 mb-4">
              Connect with professionals to see their posts here, or share your first update.
            </p>
            <Button size="sm" onClick={() => navigate('/network')}>Explore Network</Button>
          </Card>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} />
          ))
        )}

        {/* Load More */}
        {!loading && hasMore && (
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              loading={loadingMore}
              onClick={() => loadPosts(false)}
              icon={<ChevronDown size={16} />}
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
