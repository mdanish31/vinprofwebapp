import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Globe, Linkedin, Twitter, Github, CreditCard as Edit2, Plus, Briefcase, GraduationCap, Award, Eye, Users, MoreHorizontal, UserCheck, UserPlus, MessageSquare, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { Profile, Skill, Experience, Education } from '../../lib/database.types';
import { useAuth } from '../../contexts/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

interface ProfileData {
  profile: Profile;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  connectionsCount: number;
  postsCount: number;
  profileViewsCount: number;
  connectionStatus: 'none' | 'pending' | 'accepted' | 'sent';
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionLoading, setConnectionLoading] = useState(false);

  const isOwn = user?.id === id;

  useEffect(() => {
    if (!id) return;
    loadProfile();
    if (user?.id !== id) recordView();
  }, [id, user]);

  const recordView = async () => {
    if (!user) return;
    await supabase.from('profile_views').insert({ viewer_id: user.id, viewed_id: id! });
  };

  const loadProfile = async () => {
    setLoading(true);
    const [profileRes, skillsRes, expRes, eduRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id!).maybeSingle(),
      supabase.from('skills').select('*').eq('profile_id', id!),
      supabase.from('experience').select('*').eq('profile_id', id!).order('start_date', { ascending: false }),
      supabase.from('education').select('*').eq('profile_id', id!),
    ]);

    if (!profileRes.data) { navigate('/feed'); return; }

    const [connCountRes, postsCountRes, viewsRes, connStatusRes] = await Promise.all([
      supabase.from('connections').select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${id},addressee_id.eq.${id}`)
        .eq('status', 'accepted'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', id!),
      supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('viewed_id', id!),
      user ? supabase.from('connections').select('*').or(
        `requester_id.eq.${user.id},addressee_id.eq.${user.id}`
      ).or(`requester_id.eq.${id},addressee_id.eq.${id}`).maybeSingle() : Promise.resolve({ data: null }),
    ]);

    let connectionStatus: ProfileData['connectionStatus'] = 'none';
    if (connStatusRes.data) {
      const conn = connStatusRes.data;
      if (conn.status === 'accepted') connectionStatus = 'accepted';
      else if (conn.status === 'pending' && conn.requester_id === user?.id) connectionStatus = 'sent';
      else if (conn.status === 'pending') connectionStatus = 'pending';
    }

    setData({
      profile: profileRes.data,
      skills: skillsRes.data || [],
      experience: expRes.data || [],
      education: eduRes.data || [],
      connectionsCount: connCountRes.count || 0,
      postsCount: postsCountRes.count || 0,
      profileViewsCount: viewsRes.count || 0,
      connectionStatus,
    });
    setLoading(false);
  };

  const handleConnect = async () => {
    if (!user || !data) return;
    setConnectionLoading(true);
    if (data.connectionStatus === 'none') {
      const { error } = await supabase.from('connections').insert({
        requester_id: user.id,
        addressee_id: id!,
      });
      if (!error) {
        await supabase.from('notifications').insert({
          recipient_id: id!,
          sender_id: user.id,
          type: 'connection_request',
          title: 'New connection request',
          body: 'sent you a connection request',
          reference_id: user.id,
        });
        success('Request sent', `Connection request sent to ${data.profile.full_name}`);
        setData(d => d ? { ...d, connectionStatus: 'sent' } : d);
      }
    } else if (data.connectionStatus === 'pending') {
      const { data: conn } = await supabase
        .from('connections')
        .select('id')
        .eq('requester_id', id!)
        .eq('addressee_id', user.id)
        .maybeSingle();
      if (conn) {
        await supabase.from('connections').update({ status: 'accepted' }).eq('id', conn.id);
        await supabase.from('notifications').insert({
          recipient_id: id!,
          sender_id: user.id,
          type: 'connection_accepted',
          title: 'Connection accepted',
          body: 'accepted your connection request',
          reference_id: user.id,
        });
        success('Connected!', `You are now connected with ${data.profile.full_name}`);
        setData(d => d ? { ...d, connectionStatus: 'accepted', connectionsCount: d.connectionsCount + 1 } : d);
      }
    }
    setConnectionLoading(false);
  };

  const handleMessage = async () => {
    if (!user || !id) return;
    const p1 = user.id < id ? user.id : id;
    const p2 = user.id < id ? id : user.id;
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('participant1_id', p1)
      .eq('participant2_id', p2)
      .maybeSingle();
    if (existing) {
      navigate(`/messages?conv=${existing.id}`);
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ participant1_id: p1, participant2_id: p2 })
        .select('id')
        .single();
      if (newConv) navigate(`/messages?conv=${newConv.id}`);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!data) return null;
  const { profile, skills, experience, education, connectionsCount, postsCount, profileViewsCount, connectionStatus } = data;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Profile Header Card */}
        <Card padding="none" className="overflow-hidden">
          {/* Cover */}
          <div className="h-36 sm:h-48 bg-gradient-to-r from-navy-700 to-royal-600 relative">
            {profile.cover_url && (
              <img src={profile.cover_url} alt="cover" className="w-full h-full object-cover" />
            )}
            {isOwn && (
              <button
                onClick={() => navigate('/profile/edit')}
                className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 text-white rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
            )}
          </div>

          <div className="px-5 pb-5">
            {/* Avatar + Actions */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <Avatar
                  src={profile.avatar_url}
                  name={profile.full_name}
                  size="2xl"
                  className="ring-4 ring-white shadow-card"
                />
                {profile.is_open_to_work && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Open to work
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                {isOwn ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit2 size={15} />}
                    onClick={() => navigate('/profile/edit')}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    {connectionStatus === 'accepted' && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<MessageSquare size={15} />}
                        onClick={handleMessage}
                      >
                        Message
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={connectionStatus === 'accepted' ? 'secondary' : connectionStatus === 'sent' ? 'outline' : 'primary'}
                      loading={connectionLoading}
                      icon={connectionStatus === 'accepted' ? <UserCheck size={15} /> : connectionStatus === 'sent' ? undefined : <UserPlus size={15} />}
                      onClick={connectionStatus === 'none' || connectionStatus === 'pending' ? handleConnect : undefined}
                      disabled={connectionStatus === 'sent'}
                    >
                      {connectionStatus === 'accepted' ? 'Connected' : connectionStatus === 'sent' ? 'Request Sent' : connectionStatus === 'pending' ? 'Accept' : 'Connect'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Name, headline */}
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{profile.full_name}</h1>
              {profile.headline && <p className="text-gray-600 mt-0.5">{profile.headline}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                {profile.job_title && (
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {profile.job_title}{profile.current_company && ` at ${profile.current_company}`}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {profile.location}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-5 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-lg font-bold text-navy-900">{connectionsCount}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1"><Users size={11} />Connections</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-navy-900">{postsCount}</div>
                <div className="text-xs text-gray-500">Posts</div>
              </div>
              {isOwn && (
                <div className="text-center">
                  <div className="text-lg font-bold text-navy-900">{profileViewsCount}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1"><Eye size={11} />Views</div>
                </div>
              )}
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-3">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-navy-700 transition-colors">
                  <Globe size={18} />
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-royal-600 transition-colors">
                  <Linkedin size={18} />
                </a>
              )}
              {profile.twitter_url && (
                <a href={profile.twitter_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Twitter size={18} />
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-800 transition-colors">
                  <Github size={18} />
                </a>
              )}
            </div>
          </div>
        </Card>

        {/* Profile completion (own profile) */}
        {isOwn && profile.profile_completion < 100 && (
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-navy-900">Profile Completion</h3>
              <span className="text-sm font-bold text-navy-700">{profile.profile_completion}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-navy-600 to-royal-500 rounded-full transition-all duration-500"
                style={{ width: `${profile.profile_completion}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Complete your profile to get more visibility and connections.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => navigate('/profile/edit')}
            >
              Complete Profile
            </Button>
          </Card>
        )}

        {/* About */}
        {profile.about && (
          <Card>
            <h2 className="text-base font-semibold text-navy-900 mb-3">About</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.about}</p>
          </Card>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-navy-900">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge key={skill.id} variant="navy">{skill.name}</Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-navy-900 flex items-center gap-2">
                <Briefcase size={16} className="text-navy-600" />
                Experience
              </h2>
            </div>
            <div className="space-y-5">
              {experience.map((exp, i) => (
                <div key={exp.id} className={`flex gap-4 ${i < experience.length - 1 ? 'pb-5 border-b border-gray-100' : ''}`}>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-sm">{exp.title}</p>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                      {exp.location && ` · ${exp.location}`}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-navy-900 flex items-center gap-2">
                <GraduationCap size={16} className="text-navy-600" />
                Education
              </h2>
            </div>
            <div className="space-y-5">
              {education.map((edu, i) => (
                <div key={edu.id} className={`flex gap-4 ${i < education.length - 1 ? 'pb-5 border-b border-gray-100' : ''}`}>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 text-sm">{edu.school}</p>
                    <p className="text-sm text-gray-600">
                      {[edu.degree, edu.field_of_study].filter(Boolean).join(', ')}
                    </p>
                    {(edu.start_year || edu.end_year) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {edu.start_year} — {edu.end_year || 'Present'}
                      </p>
                    )}
                    {edu.description && (
                      <p className="text-sm text-gray-600 mt-1.5">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty state for own profile */}
        {isOwn && !profile.about && skills.length === 0 && experience.length === 0 && education.length === 0 && (
          <Card className="text-center py-8">
            <Award size={36} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-navy-900 mb-1">Complete your profile</h3>
            <p className="text-sm text-gray-500 mb-4">Add your experience, education, and skills to stand out.</p>
            <Button size="sm" onClick={() => navigate('/profile/edit')} icon={<Plus size={15} />}>
              Build Profile
            </Button>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
