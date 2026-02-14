-- ============================================================
-- Chatting Wizard School — Supabase Database Setup
-- ============================================================
-- Run this ENTIRE script in your Supabase SQL Editor:
-- https://supabase.com > Your Project > SQL Editor > New Query
--
-- AFTER running this, create your admin account:
-- 1. Register via the school login page
-- 2. Then run this (replace with your email):
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================

-- ============================================================
-- HELPER FUNCTION: Check if current user is admin
-- (SECURITY DEFINER bypasses RLS to avoid recursion)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- TABLE 1: profiles (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- ============================================================
-- TABLE 2: progress (module completion checkboxes)
-- ============================================================
CREATE TABLE public.progress (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, module_id)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_own" ON public.progress
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_admin_read" ON public.progress
  FOR SELECT USING (public.is_admin());

-- ============================================================
-- TABLE 3: quiz_results (quiz scores, retakes overwrite)
-- ============================================================
CREATE TABLE public.quiz_results (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  score TEXT NOT NULL,
  percentage INT NOT NULL,
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, module_id)
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_own" ON public.quiz_results
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_admin_read" ON public.quiz_results
  FOR SELECT USING (public.is_admin());

-- ============================================================
-- TABLE 4: invite_codes (for self-registration)
-- ============================================================
CREATE TABLE public.invite_codes (
  code TEXT PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id),
  used_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_admin" ON public.invite_codes
  FOR ALL USING (public.is_admin());

-- ============================================================
-- TRIGGER: Auto-create profile when a user signs up
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RPC: Validate an invite code (callable by anon during signup)
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_invite_code(invite_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.invite_codes
    WHERE code = invite_code AND used_by IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Use an invite code after registration
-- ============================================================
CREATE OR REPLACE FUNCTION public.use_invite_code(invite_code TEXT, for_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  code_row RECORD;
BEGIN
  SELECT * INTO code_row FROM public.invite_codes
  WHERE code = invite_code AND used_by IS NULL;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.invite_codes
  SET used_by = for_user_id, used_at = NOW()
  WHERE code = invite_code;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Generate invite code (admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can generate invite codes';
  END IF;

  new_code := 'CW-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8));

  INSERT INTO public.invite_codes (code, created_by)
  VALUES (new_code, auth.uid());

  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: Get all students with progress (admin only)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_get_students()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      p.id,
      p.email,
      p.full_name,
      p.created_at,
      (SELECT COUNT(*) FROM public.progress pr WHERE pr.user_id = p.id) AS modules_completed,
      (SELECT COUNT(*) FROM public.quiz_results qr WHERE qr.user_id = p.id AND qr.passed = TRUE) AS quizzes_passed,
      (SELECT json_agg(json_build_object('module_id', qr.module_id, 'score', qr.score, 'percentage', qr.percentage, 'passed', qr.passed, 'submitted_at', qr.submitted_at))
       FROM public.quiz_results qr WHERE qr.user_id = p.id) AS quiz_results,
      (SELECT json_agg(pr.module_id)
       FROM public.progress pr WHERE pr.user_id = p.id) AS completed_modules
    FROM public.profiles p
    WHERE p.role = 'student'
    ORDER BY p.created_at DESC
  ) t;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
