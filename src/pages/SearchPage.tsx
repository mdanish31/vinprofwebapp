import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Users, FileText, Briefcase, Filter } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Profile, Post, Job } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Avatar } from '../components/ui/Avatar';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

type SearchTab = 'people' | 'posts' | 'jobs';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tab, setTab] = useState<SearchTab>('people');
  const [people, setPeople] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q) performSearch(q);
  }, [searchParams]);

  const performSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);

    const [peopleRes, postsRes, jobsRes] = await Promise.all([
      supabase.from('profiles').select('*').neq('id', user?.id || '')
        .or(`full_name.ilike.%${q}%,headline.ilike.%${q}%,current_company.ilike.%${q}%,job_title.ilike.%${q}%,location.ilike.%${q}%,about.ilike.%${q}%`)
        .limit(20),
      supabase.from('posts').select('*, author:profiles(*)').ilike('content', `%${q}%`).limit(20),
      supabase.from('jobs').select('*, poster:profiles(*)').eq('is_active', true)
        .or(`title.ilike.%${q}%,company.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(20),
    ]);

    setPeople(peopleRes.data || []);
    setPosts((postsRes.data as Post[]) || []);
    setJobs((jobsRes.data as Job[]) || []);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  const totalResults = people.length + posts.length + jobs.length;

  const tabs = [
    { id: 'people' as SearchTab, label: 'People', icon: Users, count: people.length },
    { id: 'posts' as SearchTab, label: 'Posts', icon: FileText, count: posts.length },
    { id: 'jobs' as SearchTab, label: 'Jobs', icon: Briefcase, count: jobs.length },
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">Search</h1>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search people, posts, jobs, companies..."
                className="w-full pl-11 pr-4 py-3.5 text-sm bg-white border border-gray-200 rounded-xl shadow-card focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition-all"
              />
              <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">Search</Button>
            </div>
          </form>
        </div>

        {!query.trim() ? (
          <Card className="text-center py-16">
            <Search size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-navy-900 mb-1">Search iampro</h3>
            <p className="text-sm text-gray-500">Search for people, posts, jobs, and companies</p>
          </Card>
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 bg-white rounded-xl border border-gray-200 p-4">
                <Skeleton circle className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {totalResults > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                {totalResults} results for "<span className="font-semibold text-navy-900">{query}</span>"
              </p>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-navy-800 shadow-card' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <t.icon size={15} />
                  {t.label}
                  {t.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-navy-100 text-navy-700' : 'bg-gray-200 text-gray-600'}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Results */}
            {tab === 'people' && (
              <div className="space-y-2">
                {people.length === 0 ? (
                  <Card className="text-center py-10">
                    <Users size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No people found for "{query}"</p>
                  </Card>
                ) : people.map(person => (
                  <button
                    key={person.id}
                    onClick={() => navigate(`/profile/${person.id}`)}
                    className="w-full flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-card-hover transition-all text-left"
                  >
                    <Avatar src={person.avatar_url} name={person.full_name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900">{person.full_name}</p>
                      <p className="text-sm text-gray-500 truncate">{person.headline || person.job_title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[person.current_company, person.location].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); navigate(`/profile/${person.id}`); }}>
                      View
                    </Button>
                  </button>
                ))}
              </div>
            )}

            {tab === 'posts' && (
              <div className="space-y-3">
                {posts.length === 0 ? (
                  <Card className="text-center py-10">
                    <FileText size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No posts found for "{query}"</p>
                  </Card>
                ) : posts.map(post => (
                  <Card key={post.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar src={post.author?.avatar_url} name={post.author?.full_name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{post.author?.full_name}</p>
                        <p className="text-xs text-gray-500">{post.author?.headline}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 line-clamp-3">{post.content}</p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-400">
                      <span>{post.likes_count} likes</span>
                      <span>{post.comments_count} comments</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {tab === 'jobs' && (
              <div className="space-y-3">
                {jobs.length === 0 ? (
                  <Card className="text-center py-10">
                    <Briefcase size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No jobs found for "{query}"</p>
                  </Card>
                ) : jobs.map(job => (
                  <button
                    key={job.id}
                    onClick={() => navigate('/jobs')}
                    className="w-full flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-card-hover transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase size={20} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-navy-900">{job.title}</p>
                      <p className="text-sm text-gray-500">{job.company}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {job.location && <span className="text-xs text-gray-400">{job.location}</span>}
                        <Badge variant="info" size="sm">{job.job_type}</Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
