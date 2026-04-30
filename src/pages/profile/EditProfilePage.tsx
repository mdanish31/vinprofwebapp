import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, ArrowLeft, Save, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { Skill, Experience, Education } from '../../lib/database.types';
import { useAuth } from '../../contexts/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';

interface ProfileForm {
  full_name: string;
  username: string;
  headline: string;
  about: string;
  current_company: string;
  job_title: string;
  location: string;
  website: string;
  linkedin_url: string;
  twitter_url: string;
  github_url: string;
  is_open_to_work: boolean;
}

export default function EditProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<ProfileForm>({
    full_name: '',
    username: '',
    headline: '',
    about: '',
    current_company: '',
    job_title: '',
    location: '',
    website: '',
    linkedin_url: '',
    twitter_url: '',
    github_url: '',
    is_open_to_work: false,
  });

  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name || '',
      username: profile.username || '',
      headline: profile.headline || '',
      about: profile.about || '',
      current_company: profile.current_company || '',
      job_title: profile.job_title || '',
      location: profile.location || '',
      website: profile.website || '',
      linkedin_url: profile.linkedin_url || '',
      twitter_url: profile.twitter_url || '',
      github_url: profile.github_url || '',
      is_open_to_work: profile.is_open_to_work || false,
    });
    setAvatarUrl(profile.avatar_url || '');
    loadDetails();
  }, [profile]);

  const loadDetails = async () => {
    if (!user) return;
    const [skillsRes, expRes, eduRes] = await Promise.all([
      supabase.from('skills').select('*').eq('profile_id', user.id),
      supabase.from('experience').select('*').eq('profile_id', user.id).order('start_date', { ascending: false }),
      supabase.from('education').select('*').eq('profile_id', user.id),
    ]);
    setSkills(skillsRes.data || []);
    setExperience(expRes.data || []);
    setEducation(eduRes.data || []);
  };

  const calcCompletion = () => {
    let score = 0;
    if (form.full_name) score += 15;
    if (form.headline) score += 10;
    if (form.about) score += 15;
    if (form.job_title) score += 10;
    if (form.current_company) score += 10;
    if (form.location) score += 5;
    if (avatarUrl) score += 15;
    if (skills.length > 0) score += 10;
    if (experience.length > 0) score += 5;
    if (education.length > 0) score += 5;
    return Math.min(score, 100);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const completion = calcCompletion();
    const { error } = await supabase.from('profiles').update({
      ...form,
      avatar_url: avatarUrl,
      profile_completion: completion,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    setSaving(false);
    if (error) {
      toastError('Failed to save', error.message);
    } else {
      await refreshProfile();
      success('Profile saved!');
      navigate(`/profile/${user.id}`);
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(data.publicUrl + '?t=' + Date.now());
    }
    setUploading(false);
  };

  const addSkill = async () => {
    if (!newSkill.trim() || !user) return;
    const { data } = await supabase.from('skills').insert({ profile_id: user.id, name: newSkill.trim() }).select().single();
    if (data) setSkills(s => [...s, data]);
    setNewSkill('');
  };

  const removeSkill = async (id: string) => {
    await supabase.from('skills').delete().eq('id', id);
    setSkills(s => s.filter(sk => sk.id !== id));
  };

  const addExperience = async () => {
    if (!user) return;
    const { data } = await supabase.from('experience').insert({
      profile_id: user.id,
      title: 'New Position',
      company: 'Company Name',
    }).select().single();
    if (data) setExperience(e => [data, ...e]);
  };

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setExperience(e => e.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const saveExperience = async (exp: Experience) => {
    await supabase.from('experience').update(exp).eq('id', exp.id);
  };

  const removeExperience = async (id: string) => {
    await supabase.from('experience').delete().eq('id', id);
    setExperience(e => e.filter(exp => exp.id !== id));
  };

  const addEducation = async () => {
    if (!user) return;
    const { data } = await supabase.from('education').insert({
      profile_id: user.id,
      school: 'University Name',
    }).select().single();
    if (data) setEducation(e => [...e, data]);
  };

  const updateEducation = (id: string, field: string, value: string | number) => {
    setEducation(e => e.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const saveEducation = async (edu: Education) => {
    await supabase.from('education').update(edu).eq('id', edu.id);
  };

  const removeEducation = async (id: string) => {
    await supabase.from('education').delete().eq('id', id);
    setEducation(e => e.filter(edu => edu.id !== id));
  };

  const f = (field: keyof ProfileForm, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <Button loading={saving} onClick={handleSave} icon={<Save size={15} />}>
            Save Changes
          </Button>
        </div>

        {/* Avatar */}
        <Card>
          <h2 className="text-base font-semibold text-navy-900 mb-4">Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar src={avatarUrl} name={form.full_name} size="2xl" />
              {uploading && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <Loader size={20} className="text-white animate-spin" />
                </div>
              )}
            </div>
            <div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              <Button variant="outline" size="sm" icon={<Upload size={14} />} onClick={() => avatarRef.current?.click()}>
                Upload Photo
              </Button>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP — max 5MB</p>
            </div>
          </div>
        </Card>

        {/* Basic Info */}
        <Card>
          <h2 className="text-base font-semibold text-navy-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={form.full_name} onChange={e => f('full_name', e.target.value)} placeholder="Jane Smith" />
              <Input label="Username" value={form.username} onChange={e => f('username', e.target.value)} placeholder="janesmith" />
            </div>
            <Input label="Headline" value={form.headline} onChange={e => f('headline', e.target.value)} placeholder="Senior Software Engineer at Google" />
            <Textarea label="About" value={form.about} onChange={e => f('about', e.target.value)} placeholder="Tell your professional story..." rows={4} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Job Title" value={form.job_title} onChange={e => f('job_title', e.target.value)} placeholder="Software Engineer" />
              <Input label="Company" value={form.current_company} onChange={e => f('current_company', e.target.value)} placeholder="Acme Corp" />
            </div>
            <Input label="Location" value={form.location} onChange={e => f('location', e.target.value)} placeholder="San Francisco, CA" />
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => f('is_open_to_work', !form.is_open_to_work)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.is_open_to_work ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all ${form.is_open_to_work ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Open to work</span>
            </label>
          </div>
        </Card>

        {/* Links */}
        <Card>
          <h2 className="text-base font-semibold text-navy-900 mb-4">Links & Social</h2>
          <div className="space-y-3">
            <Input label="Website" value={form.website} onChange={e => f('website', e.target.value)} placeholder="https://yoursite.com" />
            <Input label="LinkedIn" value={form.linkedin_url} onChange={e => f('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
            <Input label="Twitter / X" value={form.twitter_url} onChange={e => f('twitter_url', e.target.value)} placeholder="https://twitter.com/..." />
            <Input label="GitHub" value={form.github_url} onChange={e => f('github_url', e.target.value)} placeholder="https://github.com/..." />
          </div>
        </Card>

        {/* Skills */}
        <Card>
          <h2 className="text-base font-semibold text-navy-900 mb-4">Skills</h2>
          <div className="flex gap-2 mb-3">
            <Input
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
              onKeyDown={e => e.key === 'Enter' && addSkill()}
            />
            <Button variant="outline" size="sm" onClick={addSkill} icon={<Plus size={15} />}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <div key={skill.id} className="flex items-center gap-1 bg-navy-50 text-navy-700 px-3 py-1 rounded-full text-sm">
                {skill.name}
                <button onClick={() => removeSkill(skill.id)} className="text-navy-400 hover:text-red-500 transition-colors ml-1">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Experience */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-navy-900">Experience</h2>
            <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={addExperience}>Add</Button>
          </div>
          <div className="space-y-6">
            {experience.map(exp => (
              <div key={exp.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex justify-end">
                  <button onClick={() => removeExperience(exp.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label="Title" value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} onBlur={() => saveExperience(exp)} />
                  <Input label="Company" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} onBlur={() => saveExperience(exp)} />
                </div>
                <Input label="Location" value={exp.location || ''} onChange={e => updateExperience(exp.id, 'location', e.target.value)} onBlur={() => saveExperience(exp)} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label="Start Date" type="date" value={exp.start_date || ''} onChange={e => updateExperience(exp.id, 'start_date', e.target.value)} onBlur={() => saveExperience(exp)} />
                  <Input label="End Date" type="date" value={exp.end_date || ''} onChange={e => updateExperience(exp.id, 'end_date', e.target.value)} disabled={exp.is_current} onBlur={() => saveExperience(exp)} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={exp.is_current} onChange={e => { updateExperience(exp.id, 'is_current', e.target.checked); saveExperience({ ...exp, is_current: e.target.checked }); }} className="rounded" />
                  <span className="text-sm text-gray-700">I currently work here</span>
                </label>
                <Textarea label="Description" value={exp.description || ''} onChange={e => updateExperience(exp.id, 'description', e.target.value)} onBlur={() => saveExperience(exp)} rows={3} />
              </div>
            ))}
            {experience.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No experience added yet.</p>
            )}
          </div>
        </Card>

        {/* Education */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-navy-900">Education</h2>
            <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={addEducation}>Add</Button>
          </div>
          <div className="space-y-6">
            {education.map(edu => (
              <div key={edu.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex justify-end">
                  <button onClick={() => removeEducation(edu.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
                <Input label="School" value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} onBlur={() => saveEducation(edu)} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label="Degree" value={edu.degree || ''} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} onBlur={() => saveEducation(edu)} />
                  <Input label="Field of Study" value={edu.field_of_study || ''} onChange={e => updateEducation(edu.id, 'field_of_study', e.target.value)} onBlur={() => saveEducation(edu)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label="Start Year" type="number" value={edu.start_year || ''} onChange={e => updateEducation(edu.id, 'start_year', Number(e.target.value))} onBlur={() => saveEducation(edu)} />
                  <Input label="End Year" type="number" value={edu.end_year || ''} onChange={e => updateEducation(edu.id, 'end_year', Number(e.target.value))} onBlur={() => saveEducation(edu)} />
                </div>
                <Textarea label="Description" value={edu.description || ''} onChange={e => updateEducation(edu.id, 'description', e.target.value)} onBlur={() => saveEducation(edu)} rows={2} />
              </div>
            ))}
            {education.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No education added yet.</p>
            )}
          </div>
        </Card>

        <div className="flex justify-end pb-4">
          <Button loading={saving} onClick={handleSave} size="lg" icon={<Save size={16} />}>
            Save All Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
