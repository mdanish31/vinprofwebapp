import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Briefcase, Eye, TrendingUp, BarChart3, ArrowRight, UserPlus, Bell, CreditCard as Edit } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Profile, Notification } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

interface DashboardStats {
  connections: number;
  posts: number;
  applications: number;
  profileViews: number;
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({ connections: 0, posts: 0, applications: 0, profileViews: 0 });
  const [suggested, setSuggested] = useState<Profile[]>([]);
  const [recentNotifs, setRecentNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    const [connRes, postsRes, appsRes, viewsRes, suggestedRes, notifsRes] = await Promise.all([
      supabase.from('connections').select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`)
        .eq('status', 'accepted'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user!.id),
      supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('applicant_id', user!.id),
      supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('viewed_id', user!.id),
      supabase.from('profiles').select('*').neq('id', user!.id).limit(6),
      supabase.from('notifications').select('*, sender:profiles(*)').eq('recipient_id', user!.id)
        .order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      connections: connRes.count || 0,
      posts: postsRes.count || 0,
      applications: appsRes.count || 0,
      profileViews: viewsRes.count || 0,
    });
    setSuggested(suggestedRes.data || []);
    setRecentNotifs((notifsRes.data as Notification[]) || []);
    setLoading(false);
  };

  const statCards = [
    { label: 'Connections', value: stats.connections, icon: Users, color: 'bg-blue-50 text-royal-600', change: '+5 this week' },
    { label: 'Posts', value: stats.posts, icon: FileText, color: 'bg-emerald-50 text-emerald-600', change: 'Total posts' },
    { label: 'Applications', value: stats.applications, icon: Briefcase, color: 'bg-amber-50 text-amber-600', change: 'Total applied' },
    { label: 'Profile Views', value: stats.profileViews, icon: Eye, color: 'bg-navy-50 text-navy-700', change: 'All time' },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-start gap-4 bg-gradient-to-r from-navy-800 to-royal-700 rounded-2xl p-6 text-white">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0] || 'Professional'}!</h1>
            <p className="text-white/70 mt-1 text-sm">{profile?.headline || 'Complete your profile to stand out.'}</p>
            {profile && profile.profile_completion < 100 && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-white/70">Profile completion</span>
                  <span className="text-xs font-bold">{profile.profile_completion}%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${profile.profile_completion}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10 flex-shrink-0 hidden sm:flex"
            icon={<Edit size={14} />}
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
          ) : statCards.map(({ label, value, icon: Icon, color, change }) => (
            <Card key={label} className="hover:shadow-card-hover transition-shadow">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-2xl font-bold text-navy-900">{value}</div>
              <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{change}</div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Suggested Connections */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-900 flex items-center gap-2">
                <Users size={16} className="text-navy-600" />
                People You May Know
              </h2>
              <button
                onClick={() => navigate('/network')}
                className="text-xs text-royal-600 hover:text-royal-700 font-medium flex items-center gap-1 transition-colors"
              >
                See all <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton circle className="w-10 h-10" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                ))
              ) : suggested.slice(0, 5).map(person => (
                <div key={person.id} className="flex items-center gap-3">
                  <button onClick={() => navigate(`/profile/${person.id}`)}>
                    <Avatar src={person.avatar_url} name={person.full_name} size="md" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate(`/profile/${person.id}`)}
                      className="text-sm font-semibold text-navy-900 hover:underline truncate block"
                    >
                      {person.full_name}
                    </button>
                    <p className="text-xs text-gray-500 truncate">{person.headline || person.job_title}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<UserPlus size={13} />}
                    onClick={() => navigate(`/profile/${person.id}`)}
                  >
                    Connect
                  </Button>
                </div>
              ))}
              {!loading && suggested.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-3">No suggestions available</p>
              )}
            </div>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-navy-900 flex items-center gap-2">
                <Bell size={16} className="text-navy-600" />
                Recent Activity
              </h2>
              <button
                onClick={() => navigate('/notifications')}
                className="text-xs text-royal-600 hover:text-royal-700 font-medium flex items-center gap-1 transition-colors"
              >
                See all <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton circle className="w-10 h-10" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : recentNotifs.length === 0 ? (
                <div className="text-center py-6">
                  <Bell size={28} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              ) : recentNotifs.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => navigate('/notifications')}
                  className={`w-full flex items-center gap-3 text-left rounded-xl p-2 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''}`}
                >
                  <Avatar src={notif.sender?.avatar_url} name={notif.sender?.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 line-clamp-2">
                      <span className="font-semibold">{notif.sender?.full_name}</span>
                      {' '}{notif.body || notif.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && <div className="w-2 h-2 bg-royal-500 rounded-full flex-shrink-0" />}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h2 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-navy-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Write a Post', icon: FileText, action: () => navigate('/feed'), color: 'bg-blue-50 text-royal-600' },
              { label: 'Find Connections', icon: Users, action: () => navigate('/network'), color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Browse Jobs', icon: Briefcase, action: () => navigate('/jobs'), color: 'bg-amber-50 text-amber-600' },
              { label: 'Edit Profile', icon: Edit, action: () => navigate('/profile/edit'), color: 'bg-navy-50 text-navy-700' },
            ].map(({ label, icon: Icon, action, color }) => (
              <button
                key={label}
                onClick={action}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
