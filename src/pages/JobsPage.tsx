import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, DollarSign, Plus, Search, Bookmark, BookmarkCheck,
  ChevronRight, Filter, X, Building2, Users, CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Job, JobApplication } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { JobCardSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

type JobTab = 'browse' | 'my-jobs' | 'applications' | 'saved';

const jobTypeColors: Record<string, 'success' | 'info' | 'warning' | 'navy'> = {
  'full-time': 'success',
  'part-time': 'info',
  'contract': 'warning',
  'internship': 'navy',
  'remote': 'success',
};

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600) return 'Just now';
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function JobsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [tab, setTab] = useState<JobTab>('browse');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [showPostJob, setShowPostJob] = useState(false);
  const [showApply, setShowApply] = useState<Job | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [jobForm, setJobForm] = useState({
    title: '', company: profile?.current_company || '', location: '',
    job_type: 'full-time' as Job['job_type'], salary_min: '', salary_max: '',
    description: '', requirements: '', skills_required: '',
  });
  const [applyForm, setApplyForm] = useState({ cover_letter: '' });
  const [posting, setPosting] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (user) loadJobs();
  }, [user]);

  const loadJobs = async () => {
    setLoading(true);
    const [jobsRes, savedRes, appliedRes, myJobsRes, appsRes] = await Promise.all([
      supabase.from('jobs').select('*, poster:profiles(*)').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('saved_jobs').select('job_id').eq('user_id', user!.id),
      supabase.from('job_applications').select('job_id').eq('applicant_id', user!.id),
      supabase.from('jobs').select('*').eq('poster_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('job_applications').select('*, job:jobs(*)').eq('applicant_id', user!.id).order('created_at', { ascending: false }),
    ]);
    setJobs((jobsRes.data || []) as Job[]);
    setSavedJobIds(new Set((savedRes.data || []).map(s => s.job_id)));
    setAppliedJobIds(new Set((appliedRes.data || []).map(a => a.job_id)));
    setMyJobs(myJobsRes.data || []);
    setApplications((appsRes.data || []) as JobApplication[]);
    setLoading(false);
  };

  const toggleSave = async (job: Job) => {
    const saved = savedJobIds.has(job.id);
    if (saved) {
      await supabase.from('saved_jobs').delete().eq('user_id', user!.id).eq('job_id', job.id);
      setSavedJobIds(prev => { const s = new Set(prev); s.delete(job.id); return s; });
    } else {
      await supabase.from('saved_jobs').insert({ user_id: user!.id, job_id: job.id });
      setSavedJobIds(prev => new Set([...prev, job.id]));
    }
  };

  const postJob = async () => {
    if (!user) return;
    setPosting(true);
    const skills = jobForm.skills_required.split(',').map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from('jobs').insert({
      poster_id: user.id,
      title: jobForm.title,
      company: jobForm.company,
      location: jobForm.location,
      job_type: jobForm.job_type,
      salary_min: jobForm.salary_min ? Number(jobForm.salary_min) : null,
      salary_max: jobForm.salary_max ? Number(jobForm.salary_max) : null,
      description: jobForm.description,
      requirements: jobForm.requirements,
      skills_required: skills,
    });
    setPosting(false);
    if (error) { toastError('Failed to post job', error.message); return; }
    success('Job posted!');
    setShowPostJob(false);
    setJobForm({ title: '', company: profile?.current_company || '', location: '', job_type: 'full-time', salary_min: '', salary_max: '', description: '', requirements: '', skills_required: '' });
    loadJobs();
  };

  const applyJob = async () => {
    if (!user || !showApply) return;
    setApplying(true);
    const { error } = await supabase.from('job_applications').insert({
      job_id: showApply.id,
      applicant_id: user.id,
      cover_letter: applyForm.cover_letter,
    });
    setApplying(false);
    if (error) { toastError('Application failed', error.message); return; }
    await supabase.from('notifications').insert({
      recipient_id: showApply.poster_id,
      sender_id: user.id,
      type: 'job_application',
      title: 'New job application',
      body: `Someone applied to ${showApply.title}`,
      reference_id: showApply.id,
    });
    setAppliedJobIds(prev => new Set([...prev, showApply.id]));
    success('Application submitted!');
    setShowApply(null);
    setApplyForm({ cover_letter: '' });
    loadJobs();
  };

  const displayJobs = tab === 'browse'
    ? jobs.filter(j => {
        const q = searchQuery.toLowerCase();
        const matchQuery = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q);
        const matchType = !selectedType || j.job_type === selectedType;
        return matchQuery && matchType;
      })
    : [];

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Jobs</h1>
            <p className="text-sm text-gray-500 mt-0.5">{jobs.length} open positions</p>
          </div>
          <Button size="sm" icon={<Plus size={15} />} onClick={() => setShowPostJob(true)}>Post a Job</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
          {(['browse', 'my-jobs', 'applications', 'saved'] as JobTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white text-navy-800 shadow-card' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>

        {tab === 'browse' && (
          <>
            {/* Search + Filter */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="flex-1 min-w-48">
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, companies..."
                  icon={<Search size={16} />}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedType('')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${!selectedType ? 'bg-navy-700 text-white border-navy-700' : 'border-gray-300 text-gray-600 hover:border-navy-400'}`}
                >
                  All
                </button>
                {jobTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? '' : type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${selectedType === type ? 'bg-navy-700 text-white border-navy-700' : 'border-gray-300 text-gray-600 hover:border-navy-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : displayJobs.length === 0 ? (
              <Card className="text-center py-12">
                <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-900 mb-1">No jobs found</h3>
                <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {displayJobs.map(job => (
                  <Card
                    key={job.id}
                    hover
                    onClick={() => setSelectedJob(job)}
                    className="group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-navy-50 transition-colors">
                        <Building2 size={22} className="text-gray-500 group-hover:text-navy-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy-900 text-sm leading-tight">{job.title}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{job.company}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {job.location && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <MapPin size={11} />{job.location}
                            </span>
                          )}
                          <Badge variant={jobTypeColors[job.job_type] || 'default'} size="sm">{job.job_type}</Badge>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); toggleSave(job); }}
                        className="p-1.5 text-gray-400 hover:text-navy-700 transition-colors"
                      >
                        {savedJobIds.has(job.id) ? <BookmarkCheck size={17} className="text-navy-700" /> : <Bookmark size={17} />}
                      </button>
                    </div>
                    {formatSalary(job.salary_min, job.salary_max) && (
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mb-2">
                        <DollarSign size={12} />{formatSalary(job.salary_min, job.salary_max)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{job.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
                      {appliedJobIds.has(job.id) ? (
                        <Badge variant="success" size="sm" dot>Applied</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={e => { e.stopPropagation(); setShowApply(job); }}
                          icon={<ChevronRight size={14} />}
                          iconPosition="right"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'my-jobs' && (
          <div className="space-y-3">
            {myJobs.length === 0 ? (
              <Card className="text-center py-12">
                <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-900 mb-1">No jobs posted yet</h3>
                <p className="text-sm text-gray-500 mb-4">Post a job to find great candidates.</p>
                <Button size="sm" icon={<Plus size={15} />} onClick={() => setShowPostJob(true)}>Post First Job</Button>
              </Card>
            ) : myJobs.map(job => (
              <Card key={job.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-navy-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company} · {job.location}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users size={11} />{job.applications_count} applicants</span>
                      <span>{timeAgo(job.created_at)}</span>
                      <Badge variant={job.is_active ? 'success' : 'default'} size="sm">{job.is_active ? 'Active' : 'Closed'}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'applications' && (
          <div className="space-y-3">
            {applications.length === 0 ? (
              <Card className="text-center py-12">
                <CheckCircle2 size={40} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-900 mb-1">No applications yet</h3>
                <p className="text-sm text-gray-500">Browse open positions and start applying.</p>
              </Card>
            ) : applications.map(app => (
              <Card key={app.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-navy-900">{app.job?.title}</h3>
                    <p className="text-sm text-gray-500">{app.job?.company} · {app.job?.location}</p>
                    <p className="text-xs text-gray-400 mt-1">Applied {timeAgo(app.created_at)}</p>
                  </div>
                  <Badge
                    variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : app.status === 'interview' ? 'info' : 'default'}
                    size="sm"
                    className="capitalize"
                  >
                    {app.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'saved' && (
          <div className="space-y-3">
            {savedJobIds.size === 0 ? (
              <Card className="text-center py-12">
                <Bookmark size={40} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-900 mb-1">No saved jobs</h3>
                <p className="text-sm text-gray-500">Save interesting jobs to apply later.</p>
              </Card>
            ) : (
              jobs.filter(j => savedJobIds.has(j.id)).map(job => (
                <Card key={job.id} hover onClick={() => setSelectedJob(job)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-navy-900">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.company} · {job.location}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={e => { e.stopPropagation(); setShowApply(job); }}
                      disabled={appliedJobIds.has(job.id)}
                    >
                      {appliedJobIds.has(job.id) ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Post Job Modal */}
      <Modal open={showPostJob} onClose={() => setShowPostJob(false)} title="Post a Job" maxWidth="lg">
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Job Title *" value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Engineer" />
            <Input label="Company *" value={jobForm.company} onChange={e => setJobForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Location" value={jobForm.location} onChange={e => setJobForm(f => ({ ...f, location: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select
                value={jobForm.job_type}
                onChange={e => setJobForm(f => ({ ...f, job_type: e.target.value as Job['job_type'] }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              >
                {['full-time', 'part-time', 'contract', 'internship', 'remote'].map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Min Salary ($/yr)" type="number" value={jobForm.salary_min} onChange={e => setJobForm(f => ({ ...f, salary_min: e.target.value }))} placeholder="60000" />
            <Input label="Max Salary ($/yr)" type="number" value={jobForm.salary_max} onChange={e => setJobForm(f => ({ ...f, salary_max: e.target.value }))} placeholder="120000" />
          </div>
          <Textarea label="Description *" value={jobForm.description} onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Describe the role..." />
          <Textarea label="Requirements" value={jobForm.requirements} onChange={e => setJobForm(f => ({ ...f, requirements: e.target.value }))} rows={3} />
          <Input label="Required Skills (comma-separated)" value={jobForm.skills_required} onChange={e => setJobForm(f => ({ ...f, skills_required: e.target.value }))} placeholder="React, TypeScript, Node.js" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowPostJob(false)}>Cancel</Button>
            <Button loading={posting} disabled={!jobForm.title || !jobForm.company} onClick={postJob}>Post Job</Button>
          </div>
        </div>
      </Modal>

      {/* Apply Modal */}
      <Modal open={!!showApply} onClose={() => setShowApply(null)} title="Apply for Position" maxWidth="md">
        {showApply && (
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-navy-900">{showApply.title}</h3>
              <p className="text-sm text-gray-500">{showApply.company} · {showApply.location}</p>
            </div>
            <Textarea
              label="Cover Letter (optional)"
              value={applyForm.cover_letter}
              onChange={e => setApplyForm(f => ({ ...f, cover_letter: e.target.value }))}
              placeholder="Tell them why you're a great fit..."
              rows={5}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowApply(null)}>Cancel</Button>
              <Button loading={applying} onClick={applyJob}>Submit Application</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Job Detail Modal */}
      <Modal open={!!selectedJob} onClose={() => setSelectedJob(null)} title={selectedJob?.title || ''} maxWidth="lg">
        {selectedJob && (
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={24} className="text-gray-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900">{selectedJob.title}</h2>
                <p className="text-gray-600">{selectedJob.company}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedJob.location && (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={13} />{selectedJob.location}
                    </span>
                  )}
                  <Badge variant={jobTypeColors[selectedJob.job_type] || 'default'}>{selectedJob.job_type}</Badge>
                  {formatSalary(selectedJob.salary_min, selectedJob.salary_max) && (
                    <span className="text-sm text-emerald-600 font-medium">{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>
                  )}
                </div>
              </div>
            </div>

            {selectedJob.description && (
              <div>
                <h3 className="font-semibold text-navy-900 mb-2">About the Role</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedJob.description}</p>
              </div>
            )}

            {selectedJob.requirements && (
              <div>
                <h3 className="font-semibold text-navy-900 mb-2">Requirements</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedJob.requirements}</p>
              </div>
            )}

            {selectedJob.skills_required?.length > 0 && (
              <div>
                <h3 className="font-semibold text-navy-900 mb-2">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills_required.map(s => <Badge key={s} variant="navy">{s}</Badge>)}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => toggleSave(selectedJob)}
                className="p-2.5 border border-gray-300 rounded-lg text-gray-500 hover:text-navy-700 hover:border-navy-400 transition-colors"
              >
                {savedJobIds.has(selectedJob.id) ? <BookmarkCheck size={18} className="text-navy-700" /> : <Bookmark size={18} />}
              </button>
              {appliedJobIds.has(selectedJob.id) ? (
                <Button fullWidth variant="outline" disabled icon={<CheckCircle2 size={16} />}>Applied</Button>
              ) : (
                <Button fullWidth onClick={() => { setSelectedJob(null); setShowApply(selectedJob); }}>Apply Now</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
