/*
  # iampro Full Schema — all 15 tables with RLS, triggers, storage buckets
*/

-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text NOT NULL DEFAULT '',
  headline text DEFAULT '',
  about text DEFAULT '',
  current_company text DEFAULT '',
  job_title text DEFAULT '',
  location text DEFAULT '',
  avatar_url text DEFAULT '',
  cover_url text DEFAULT '',
  website text DEFAULT '',
  linkedin_url text DEFAULT '',
  twitter_url text DEFAULT '',
  github_url text DEFAULT '',
  profile_completion integer DEFAULT 0,
  is_open_to_work boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Profiles are viewable by authenticated users') THEN
    CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can delete own profile') THEN
    CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);
  END IF;
END $$;

-- =========================================
-- SKILLS
-- =========================================
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='skills' AND policyname='Skills viewable by authenticated users') THEN
    CREATE POLICY "Skills viewable by authenticated users" ON skills FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='skills' AND policyname='Users can insert own skills') THEN
    CREATE POLICY "Users can insert own skills" ON skills FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='skills' AND policyname='Users can update own skills') THEN
    CREATE POLICY "Users can update own skills" ON skills FOR UPDATE TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='skills' AND policyname='Users can delete own skills') THEN
    CREATE POLICY "Users can delete own skills" ON skills FOR DELETE TO authenticated USING (auth.uid() = profile_id);
  END IF;
END $$;

-- =========================================
-- EXPERIENCE
-- =========================================
CREATE TABLE IF NOT EXISTS experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  location text DEFAULT '',
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE experience ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experience' AND policyname='Experience viewable by authenticated users') THEN
    CREATE POLICY "Experience viewable by authenticated users" ON experience FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experience' AND policyname='Users can insert own experience') THEN
    CREATE POLICY "Users can insert own experience" ON experience FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experience' AND policyname='Users can update own experience') THEN
    CREATE POLICY "Users can update own experience" ON experience FOR UPDATE TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='experience' AND policyname='Users can delete own experience') THEN
    CREATE POLICY "Users can delete own experience" ON experience FOR DELETE TO authenticated USING (auth.uid() = profile_id);
  END IF;
END $$;

-- =========================================
-- EDUCATION
-- =========================================
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school text NOT NULL DEFAULT '',
  degree text DEFAULT '',
  field_of_study text DEFAULT '',
  start_year integer,
  end_year integer,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='education' AND policyname='Education viewable by authenticated users') THEN
    CREATE POLICY "Education viewable by authenticated users" ON education FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='education' AND policyname='Users can insert own education') THEN
    CREATE POLICY "Users can insert own education" ON education FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='education' AND policyname='Users can update own education') THEN
    CREATE POLICY "Users can update own education" ON education FOR UPDATE TO authenticated USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='education' AND policyname='Users can delete own education') THEN
    CREATE POLICY "Users can delete own education" ON education FOR DELETE TO authenticated USING (auth.uid() = profile_id);
  END IF;
END $$;

-- =========================================
-- POSTS
-- =========================================
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='Posts viewable by authenticated users') THEN
    CREATE POLICY "Posts viewable by authenticated users" ON posts FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='Users can insert own posts') THEN
    CREATE POLICY "Users can insert own posts" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='Users can update own posts') THEN
    CREATE POLICY "Users can update own posts" ON posts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='posts' AND policyname='Users can delete own posts') THEN
    CREATE POLICY "Users can delete own posts" ON posts FOR DELETE TO authenticated USING (auth.uid() = author_id);
  END IF;
END $$;

-- =========================================
-- POST LIKES
-- =========================================
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_likes' AND policyname='Post likes viewable by authenticated users') THEN
    CREATE POLICY "Post likes viewable by authenticated users" ON post_likes FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_likes' AND policyname='Users can insert own likes') THEN
    CREATE POLICY "Users can insert own likes" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_likes' AND policyname='Users can delete own likes') THEN
    CREATE POLICY "Users can delete own likes" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- =========================================
-- COMMENTS
-- =========================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='comments' AND policyname='Comments viewable by authenticated users') THEN
    CREATE POLICY "Comments viewable by authenticated users" ON comments FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='comments' AND policyname='Users can insert own comments') THEN
    CREATE POLICY "Users can insert own comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='comments' AND policyname='Users can update own comments') THEN
    CREATE POLICY "Users can update own comments" ON comments FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='comments' AND policyname='Users can delete own comments') THEN
    CREATE POLICY "Users can delete own comments" ON comments FOR DELETE TO authenticated USING (auth.uid() = author_id);
  END IF;
END $$;

-- =========================================
-- CONNECTIONS
-- =========================================
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='connections' AND policyname='Connections viewable by involved users') THEN
    CREATE POLICY "Connections viewable by involved users" ON connections FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='connections' AND policyname='Users can send connection requests') THEN
    CREATE POLICY "Users can send connection requests" ON connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='connections' AND policyname='Addressee can update connection status') THEN
    CREATE POLICY "Addressee can update connection status" ON connections FOR UPDATE TO authenticated USING (auth.uid() = addressee_id OR auth.uid() = requester_id) WITH CHECK (auth.uid() = addressee_id OR auth.uid() = requester_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='connections' AND policyname='Users can delete own connections') THEN
    CREATE POLICY "Users can delete own connections" ON connections FOR DELETE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
  END IF;
END $$;

-- =========================================
-- CONVERSATIONS
-- =========================================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message text DEFAULT '',
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant1_id, participant2_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='conversations' AND policyname='Conversations viewable by participants') THEN
    CREATE POLICY "Conversations viewable by participants" ON conversations FOR SELECT TO authenticated USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='conversations' AND policyname='Users can create conversations') THEN
    CREATE POLICY "Users can create conversations" ON conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='conversations' AND policyname='Participants can update conversations') THEN
    CREATE POLICY "Participants can update conversations" ON conversations FOR UPDATE TO authenticated USING (auth.uid() = participant1_id OR auth.uid() = participant2_id) WITH CHECK (auth.uid() = participant1_id OR auth.uid() = participant2_id);
  END IF;
END $$;

-- =========================================
-- MESSAGES
-- =========================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='Messages viewable by conversation participants') THEN
    CREATE POLICY "Messages viewable by conversation participants" ON messages FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid()))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='Users can send messages in their conversations') THEN
    CREATE POLICY "Users can send messages in their conversations" ON messages FOR INSERT TO authenticated WITH CHECK (
      auth.uid() = sender_id AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid()))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='Users can update own messages') THEN
    CREATE POLICY "Users can update own messages" ON messages FOR UPDATE TO authenticated USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;

-- =========================================
-- JOBS
-- =========================================
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  location text DEFAULT '',
  job_type text DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'remote')),
  salary_min integer,
  salary_max integer,
  description text DEFAULT '',
  requirements text DEFAULT '',
  skills_required text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  applications_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='jobs' AND policyname='Jobs viewable by authenticated users') THEN
    CREATE POLICY "Jobs viewable by authenticated users" ON jobs FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='jobs' AND policyname='Users can post jobs') THEN
    CREATE POLICY "Users can post jobs" ON jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = poster_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='jobs' AND policyname='Users can update own jobs') THEN
    CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE TO authenticated USING (auth.uid() = poster_id) WITH CHECK (auth.uid() = poster_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='jobs' AND policyname='Users can delete own jobs') THEN
    CREATE POLICY "Users can delete own jobs" ON jobs FOR DELETE TO authenticated USING (auth.uid() = poster_id);
  END IF;
END $$;

-- =========================================
-- JOB APPLICATIONS
-- =========================================
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter text DEFAULT '',
  resume_url text DEFAULT '',
  status text DEFAULT 'applied' CHECK (status IN ('applied', 'reviewed', 'interview', 'rejected', 'accepted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='job_applications' AND policyname='Applications viewable by applicant and job poster') THEN
    CREATE POLICY "Applications viewable by applicant and job poster" ON job_applications FOR SELECT TO authenticated USING (
      auth.uid() = applicant_id OR EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND jobs.poster_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='job_applications' AND policyname='Users can apply to jobs') THEN
    CREATE POLICY "Users can apply to jobs" ON job_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = applicant_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='job_applications' AND policyname='Users can update applications') THEN
    CREATE POLICY "Users can update applications" ON job_applications FOR UPDATE TO authenticated
      USING (auth.uid() = applicant_id OR EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND jobs.poster_id = auth.uid()))
      WITH CHECK (auth.uid() = applicant_id OR EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_applications.job_id AND jobs.poster_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='job_applications' AND policyname='Applicants can delete own applications') THEN
    CREATE POLICY "Applicants can delete own applications" ON job_applications FOR DELETE TO authenticated USING (auth.uid() = applicant_id);
  END IF;
END $$;

-- =========================================
-- SAVED JOBS
-- =========================================
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_jobs' AND policyname='Users can view own saved jobs') THEN
    CREATE POLICY "Users can view own saved jobs" ON saved_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_jobs' AND policyname='Users can save jobs') THEN
    CREATE POLICY "Users can save jobs" ON saved_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_jobs' AND policyname='Users can unsave jobs') THEN
    CREATE POLICY "Users can unsave jobs" ON saved_jobs FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- =========================================
-- NOTIFICATIONS
-- =========================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'post_like', 'comment', 'job_application', 'message')),
  title text NOT NULL DEFAULT '',
  body text DEFAULT '',
  reference_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Authenticated users can insert notifications') THEN
    CREATE POLICY "Authenticated users can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users can delete own notifications') THEN
    CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = recipient_id);
  END IF;
END $$;

-- =========================================
-- PROFILE VIEWS
-- =========================================
CREATE TABLE IF NOT EXISTS profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profile_views' AND policyname='Users can view own profile view records') THEN
    CREATE POLICY "Users can view own profile view records" ON profile_views FOR SELECT TO authenticated USING (auth.uid() = viewed_id OR auth.uid() = viewer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profile_views' AND policyname='Authenticated users can record profile views') THEN
    CREATE POLICY "Authenticated users can record profile views" ON profile_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = viewer_id);
  END IF;
END $$;

-- =========================================
-- INDEXES
-- =========================================
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_addressee ON connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_poster ON jobs(poster_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views(viewed_id);
CREATE INDEX IF NOT EXISTS idx_skills_profile ON skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_experience_profile ON experience(profile_id);
CREATE INDEX IF NOT EXISTS idx_education_profile ON education(profile_id);

-- =========================================
-- STORAGE BUCKETS
-- =========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('cover-images', 'cover-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('post-images', 'post-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('resumes', 'resumes', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies (safe to re-run)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Avatar images are publicly accessible') THEN
    CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Users can upload their own avatar') THEN
    CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Users can update their own avatar') THEN
    CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Cover images are publicly accessible') THEN
    CREATE POLICY "Cover images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'cover-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Users can upload cover images') THEN
    CREATE POLICY "Users can upload cover images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cover-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Post images are publicly accessible') THEN
    CREATE POLICY "Post images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Users can upload post images') THEN
    CREATE POLICY "Users can upload post images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Resumes accessible by owner') THEN
    CREATE POLICY "Resumes accessible by owner" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='objects' AND policyname='Users can upload resumes') THEN
    CREATE POLICY "Users can upload resumes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

-- =========================================
-- AUTO-CREATE PROFILE TRIGGER
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- AUTO-UPDATE LIKE COUNTS
-- =========================================
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_like ON post_likes;
CREATE TRIGGER on_post_like
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- =========================================
-- AUTO-UPDATE COMMENT COUNTS
-- =========================================
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment ON comments;
CREATE TRIGGER on_comment
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();
