import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, X, Search, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Profile, Connection } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { ProfileCardSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

type Tab = 'discover' | 'connections' | 'pending';

interface PeopleCard {
  profile: Profile;
  connectionStatus: 'none' | 'pending' | 'accepted' | 'sent';
  connectionId?: string;
}

export default function NetworkPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

  const [tab, setTab] = useState<Tab>('discover');
  const [people, setPeople] = useState<PeopleCard[]>([]);
  const [connections, setConnections] = useState<PeopleCard[]>([]);
  const [pending, setPending] = useState<PeopleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PeopleCard[]>([]);

  useEffect(() => {
    if (user) loadNetwork();
  }, [user]);

  const loadNetwork = async () => {
    setLoading(true);

    const [profilesRes, connectionsRes] = await Promise.all([
      supabase.from('profiles').select('*').neq('id', user!.id).limit(30),
      supabase.from('connections').select('*, requester:profiles!connections_requester_id_fkey(*), addressee:profiles!connections_addressee_id_fkey(*)')
        .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`),
    ]);

    const myConnections = connectionsRes.data || [];

    const statusMap = new Map<string, { status: string; id: string; requester_id: string }>();
    for (const c of myConnections) {
      const otherId = c.requester_id === user!.id ? c.addressee_id : c.requester_id;
      statusMap.set(otherId, { status: c.status, id: c.id, requester_id: c.requester_id });
    }

    const getStatus = (profileId: string): PeopleCard['connectionStatus'] => {
      const c = statusMap.get(profileId);
      if (!c) return 'none';
      if (c.status === 'accepted') return 'accepted';
      if (c.status === 'pending' && c.requester_id === user!.id) return 'sent';
      if (c.status === 'pending') return 'pending';
      return 'none';
    };

    const allPeople: PeopleCard[] = (profilesRes.data || []).map(p => ({
      profile: p,
      connectionStatus: getStatus(p.id),
      connectionId: statusMap.get(p.id)?.id,
    }));

    setPeople(allPeople.filter(p => p.connectionStatus === 'none').slice(0, 20));
    setConnections(allPeople.filter(p => p.connectionStatus === 'accepted'));
    setPending(allPeople.filter(p => p.connectionStatus === 'pending'));

    setLoading(false);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user!.id)
      .or(`full_name.ilike.%${q}%,headline.ilike.%${q}%,current_company.ilike.%${q}%,job_title.ilike.%${q}%,location.ilike.%${q}%`)
      .limit(20);

    const [connectionsRes] = await [
      supabase.from('connections').select('*')
        .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`)
    ];

    const myConnections = connectionsRes.data || [];
    const statusMap = new Map<string, { status: string; requester_id: string }>();
    for (const c of myConnections) {
      const otherId = c.requester_id === user!.id ? c.addressee_id : c.requester_id;
      statusMap.set(otherId, { status: c.status, requester_id: c.requester_id });
    }

    const results: PeopleCard[] = (data || []).map(p => {
      const c = statusMap.get(p.id);
      let status: PeopleCard['connectionStatus'] = 'none';
      if (c) {
        if (c.status === 'accepted') status = 'accepted';
        else if (c.status === 'pending' && c.requester_id === user!.id) status = 'sent';
        else if (c.status === 'pending') status = 'pending';
      }
      return { profile: p, connectionStatus: status };
    });

    setSearchResults(results);
    setSearching(false);
  };

  const handleConnect = async (personCard: PeopleCard, list: PeopleCard[], setter: React.Dispatch<React.SetStateAction<PeopleCard[]>>) => {
    if (!user) return;
    const { error } = await supabase.from('connections').insert({
      requester_id: user.id,
      addressee_id: personCard.profile.id,
    });
    if (!error) {
      await supabase.from('notifications').insert({
        recipient_id: personCard.profile.id,
        sender_id: user.id,
        type: 'connection_request',
        title: 'New connection request',
        body: 'sent you a connection request',
        reference_id: user.id,
      });
      setter(prev => prev.map(p => p.profile.id === personCard.profile.id
        ? { ...p, connectionStatus: 'sent' as const }
        : p
      ));
      success('Request sent!');
    }
  };

  const handleAccept = async (pc: PeopleCard) => {
    if (!user) return;
    const { data: conn } = await supabase
      .from('connections')
      .select('id')
      .eq('requester_id', pc.profile.id)
      .eq('addressee_id', user.id)
      .maybeSingle();
    if (conn) {
      await supabase.from('connections').update({ status: 'accepted' }).eq('id', conn.id);
      await supabase.from('notifications').insert({
        recipient_id: pc.profile.id,
        sender_id: user.id,
        type: 'connection_accepted',
        title: 'Connection accepted',
        body: 'accepted your connection request',
        reference_id: user.id,
      });
      setPending(prev => prev.filter(p => p.profile.id !== pc.profile.id));
      setConnections(prev => [...prev, { ...pc, connectionStatus: 'accepted' as const }]);
      success(`Connected with ${pc.profile.full_name}`);
    }
  };

  const handleReject = async (pc: PeopleCard) => {
    if (!user) return;
    const { data: conn } = await supabase
      .from('connections')
      .select('id')
      .eq('requester_id', pc.profile.id)
      .eq('addressee_id', user.id)
      .maybeSingle();
    if (conn) {
      await supabase.from('connections').update({ status: 'rejected' }).eq('id', conn.id);
      setPending(prev => prev.filter(p => p.profile.id !== pc.profile.id));
    }
  };

  const displayList = searchQuery.trim()
    ? searchResults
    : tab === 'discover' ? people : tab === 'connections' ? connections : pending;

  const tabs = [
    { id: 'discover' as Tab, label: 'Discover', count: people.length },
    { id: 'connections' as Tab, label: 'Connections', count: connections.length },
    { id: 'pending' as Tab, label: 'Pending', count: pending.length },
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">My Network</h1>
            <p className="text-sm text-gray-500 mt-0.5">{connections.length} connections</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5">
          <Input
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search people by name, role, company..."
            icon={<Search size={16} />}
          />
        </div>

        {/* Tabs - only shown when not searching */}
        {!searchQuery.trim() && (
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${tab === t.id ? 'bg-white text-navy-800 shadow-card' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-navy-100 text-navy-700' : 'bg-gray-200 text-gray-600'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* People Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <ProfileCardSkeleton key={i} />)}
          </div>
        ) : displayList.length === 0 ? (
          <Card className="text-center py-12">
            <Users size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-navy-900 mb-1">
              {searchQuery ? 'No results found' : tab === 'pending' ? 'No pending requests' : tab === 'connections' ? 'No connections yet' : 'No suggestions'}
            </h3>
            <p className="text-sm text-gray-500">
              {tab === 'discover' && 'Check back later for new professional suggestions.'}
              {tab === 'connections' && 'Start connecting with professionals in your field.'}
              {tab === 'pending' && 'You have no pending connection requests.'}
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayList.map(pc => (
              <Card key={pc.profile.id} padding="none" className="overflow-hidden">
                {/* Mini cover */}
                <div className="h-14 bg-gradient-to-r from-navy-600 to-royal-500" />
                <div className="px-4 pb-4 -mt-6">
                  <button onClick={() => navigate(`/profile/${pc.profile.id}`)}>
                    <Avatar
                      src={pc.profile.avatar_url}
                      name={pc.profile.full_name}
                      size="lg"
                      className="ring-2 ring-white"
                    />
                  </button>
                  <div className="mt-2">
                    <button
                      onClick={() => navigate(`/profile/${pc.profile.id}`)}
                      className="font-semibold text-navy-900 text-sm hover:underline leading-tight"
                    >
                      {pc.profile.full_name}
                    </button>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{pc.profile.headline || pc.profile.job_title}</p>
                    {pc.profile.location && (
                      <p className="text-xs text-gray-400 mt-0.5">{pc.profile.location}</p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5">
                    {tab === 'pending' || (searchQuery && pc.connectionStatus === 'pending') ? (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="primary" className="flex-1" onClick={() => handleAccept(pc)}>Accept</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleReject(pc)}><X size={15} /></Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant={pc.connectionStatus === 'accepted' ? 'outline' : pc.connectionStatus === 'sent' ? 'ghost' : 'primary'}
                        fullWidth
                        disabled={pc.connectionStatus === 'sent'}
                        onClick={() => pc.connectionStatus === 'none' && handleConnect(pc, displayList, searchQuery ? setSearchResults : tab === 'discover' ? setPeople : setConnections)}
                        icon={pc.connectionStatus === 'accepted' ? <UserCheck size={14} /> : pc.connectionStatus === 'sent' ? undefined : <UserPlus size={14} />}
                      >
                        {pc.connectionStatus === 'accepted' ? 'Connected' : pc.connectionStatus === 'sent' ? 'Pending' : 'Connect'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
