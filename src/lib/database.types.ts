export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      posts: {
        Row: Post;
        Insert: Partial<Post> & { author_id: string; content: string };
        Update: Partial<Post>;
      };
      post_likes: {
        Row: PostLike;
        Insert: { post_id: string; user_id: string };
        Update: Partial<PostLike>;
      };
      comments: {
        Row: Comment;
        Insert: { post_id: string; author_id: string; content: string };
        Update: Partial<Comment>;
      };
      connections: {
        Row: Connection;
        Insert: { requester_id: string; addressee_id: string };
        Update: Partial<Connection>;
      };
      conversations: {
        Row: Conversation;
        Insert: { participant1_id: string; participant2_id: string };
        Update: Partial<Conversation>;
      };
      messages: {
        Row: Message;
        Insert: { conversation_id: string; sender_id: string; content: string };
        Update: Partial<Message>;
      };
      jobs: {
        Row: Job;
        Insert: Partial<Job> & { poster_id: string; title: string; company: string };
        Update: Partial<Job>;
      };
      job_applications: {
        Row: JobApplication;
        Insert: { job_id: string; applicant_id: string; cover_letter?: string };
        Update: Partial<JobApplication>;
      };
      saved_jobs: {
        Row: SavedJob;
        Insert: { user_id: string; job_id: string };
        Update: Partial<SavedJob>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & { recipient_id: string; type: string; title: string };
        Update: Partial<Notification>;
      };
      profile_views: {
        Row: ProfileView;
        Insert: { viewer_id: string; viewed_id: string };
        Update: Partial<ProfileView>;
      };
      skills: {
        Row: Skill;
        Insert: { profile_id: string; name: string };
        Update: Partial<Skill>;
      };
      experience: {
        Row: Experience;
        Insert: Partial<Experience> & { profile_id: string; title: string; company: string };
        Update: Partial<Experience>;
      };
      education: {
        Row: Education;
        Insert: Partial<Education> & { profile_id: string; school: string };
        Update: Partial<Education>;
      };
    };
  };
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string;
  headline: string;
  about: string;
  current_company: string;
  job_title: string;
  location: string;
  avatar_url: string;
  cover_url: string;
  website: string;
  linkedin_url: string;
  twitter_url: string;
  github_url: string;
  profile_completion: number;
  is_open_to_work: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  liked_by_me?: boolean;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester?: Profile;
  addressee?: Profile;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
  other_participant?: Profile;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Job {
  id: string;
  poster_id: string;
  title: string;
  company: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  requirements: string;
  skills_required: string[];
  is_active: boolean;
  applications_count: number;
  created_at: string;
  updated_at: string;
  poster?: Profile;
  is_saved?: boolean;
  has_applied?: boolean;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_letter: string;
  resume_url: string;
  status: 'applied' | 'reviewed' | 'interview' | 'rejected' | 'accepted';
  created_at: string;
  updated_at: string;
  job?: Job;
  applicant?: Profile;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  job?: Job;
}

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string | null;
  type: 'connection_request' | 'connection_accepted' | 'post_like' | 'comment' | 'job_application' | 'message';
  title: string;
  body: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface ProfileView {
  id: string;
  viewer_id: string;
  viewed_id: string;
  created_at: string;
  viewer?: Profile;
}

export interface Skill {
  id: string;
  profile_id: string;
  name: string;
  created_at: string;
}

export interface Experience {
  id: string;
  profile_id: string;
  title: string;
  company: string;
  location: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string;
  created_at: string;
}

export interface Education {
  id: string;
  profile_id: string;
  school: string;
  degree: string;
  field_of_study: string;
  start_year: number | null;
  end_year: number | null;
  description: string;
  created_at: string;
}
