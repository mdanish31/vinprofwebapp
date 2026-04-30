import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, UserPlus, UserCheck, ThumbsUp, MessageCircle, Briefcase, MessageSquare, Check, CheckCheck
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Notification } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const notifIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  connection_request: { icon: <UserPlus size={16} />, color: 'bg-blue-100 text-blue-600' },
  connection_accepted: { icon: <UserCheck size={16} />, color: 'bg-emerald-100 text-emerald-600' },
  post_like: { icon: <ThumbsUp size={16} />, color: 'bg-amber-100 text-amber-600' },
  comment: { icon: <MessageCircle size={16} />, color: 'bg-navy-100 text-navy-700' },
  job_application: { icon: <Briefcase size={16} />, color: 'bg-purple-100 text-purple-600' },
  message: { icon: <MessageSquare size={16} />, color: 'bg-teal-100 text-teal-600' },
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifications();

    const channel = supabase
      .channel('notifs-page')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${user?.id}`,
      }, payload => {
        loadNotification(payload.new as Notification);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadNotification = async (notif: Notification) => {
    const { data: sender } = await supabase.from('profiles').select('*').eq('id', notif.sender_id!).maybeSingle();
    setNotifications(prev => [{ ...notif, sender: sender || undefined }, ...prev]);
  };

  const loadNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*, sender:profiles(*)')
      .eq('recipient_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('recipient_id', user!.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleNotifClick = (notif: Notification) => {
    markRead(notif.id);
    if (notif.type === 'connection_request' || notif.type === 'connection_accepted') {
      if (notif.sender_id) navigate(`/profile/${notif.sender_id}`);
    } else if (notif.type === 'post_like' || notif.type === 'comment') {
      navigate('/feed');
    } else if (notif.type === 'message') {
      navigate('/messages');
    } else if (notif.type === 'job_application') {
      navigate('/jobs');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Notifications</h1>
            {unreadCount > 0 && <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              icon={<CheckCheck size={15} />}
            >
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse-soft" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse-soft w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse-soft w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-navy-900 mb-1">No notifications yet</h3>
            <p className="text-sm text-gray-500">
              You'll see notifications here when people connect with you, like your posts, and more.
            </p>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {notifications.map(notif => {
              const iconInfo = notifIcons[notif.type];
              return (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all text-left hover:shadow-card-hover ${notif.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-100'}`}
                >
                  <div className="relative flex-shrink-0">
                    {notif.sender?.avatar_url ? (
                      <Avatar src={notif.sender.avatar_url} name={notif.sender.full_name} size="md" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconInfo?.color || 'bg-gray-100'}`}>
                        {iconInfo?.icon}
                      </div>
                    )}
                    {notif.sender && (
                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${iconInfo?.color || 'bg-gray-100'}`}>
                        {iconInfo?.icon && React.cloneElement(iconInfo.icon as React.ReactElement, { size: 10 })}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{notif.sender?.full_name}</span>
                      {' '}{notif.body || notif.title}
                    </p>
                    {notif.body && notif.title !== notif.body && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.title}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 bg-royal-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
