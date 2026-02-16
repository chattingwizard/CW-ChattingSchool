-- ============================================================
-- Chatting Wizard School — Groups & Multi-Use Codes Migration
-- ============================================================
-- Run this in Supabase SQL Editor AFTER the original migration.
-- Adds: group_name to profiles, multi-use invite codes with groups
-- ============================================================

-- ============================================================
-- 1. Add group_name to profiles
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS group_name TEXT DEFAULT NULL;

-- ============================================================
-- 2. Add group_name and max_uses to invite_codes
-- ============================================================
ALTER TABLE public.invite_codes ADD COLUMN IF NOT EXISTS group_name TEXT DEFAULT NULL;
ALTER TABLE public.invite_codes ADD COLUMN IF NOT EXISTS max_uses INT DEFAULT 1;

-- ============================================================
-- 3. Create invite_code_uses table (tracks each use of a code)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invite_code_uses (
  code TEXT REFERENCES public.invite_codes(code) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (code, user_id)
);

ALTER TABLE public.invite_code_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invite_uses_admin" ON public.invite_code_uses
  FOR ALL USING (public.is_admin());

CREATE POLICY "invite_uses_insert" ON public.invite_code_uses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. Migrate existing used codes into invite_code_uses
-- ============================================================
INSERT INTO public.invite_code_uses (code, user_id, used_at)
SELECT code, used_by, COALESCE(used_at, NOW())
FROM public.invite_codes
WHERE used_by IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. Update validate_invite_code to support multi-use
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_invite_code(invite_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  code_row RECORD;
  current_uses INT;
BEGIN
  SELECT * INTO code_row FROM public.invite_codes WHERE code = invite_code;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(*) INTO current_uses FROM public.invite_code_uses WHERE code = invite_code;

  IF code_row.max_uses IS NOT NULL AND code_row.max_uses > 0 AND current_uses >= code_row.max_uses THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. Update use_invite_code to record in uses table + set group
-- ============================================================
CREATE OR REPLACE FUNCTION public.use_invite_code(invite_code TEXT, for_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  code_row RECORD;
  current_uses INT;
BEGIN
  SELECT * INTO code_row FROM public.invite_codes WHERE code = invite_code;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(*) INTO current_uses FROM public.invite_code_uses WHERE code = invite_code;

  IF code_row.max_uses IS NOT NULL AND code_row.max_uses > 0 AND current_uses >= code_row.max_uses THEN
    RETURN FALSE;
  END IF;

  -- Record the use
  INSERT INTO public.invite_code_uses (code, user_id) VALUES (invite_code, for_user_id)
  ON CONFLICT DO NOTHING;

  -- Assign group to user profile
  IF code_row.group_name IS NOT NULL THEN
    UPDATE public.profiles SET group_name = code_row.group_name WHERE id = for_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. Update generate_invite_code to accept group + max_uses
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_invite_code(
  p_group_name TEXT DEFAULT NULL,
  p_max_uses INT DEFAULT 1
)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can generate invite codes';
  END IF;

  new_code := 'CW-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8));

  INSERT INTO public.invite_codes (code, created_by, group_name, max_uses)
  VALUES (new_code, auth.uid(), p_group_name, p_max_uses);

  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. Update admin_get_students to include group_name
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
      p.role,
      p.active,
      p.group_name,
      p.created_at,
      (SELECT COUNT(*) FROM public.progress pr WHERE pr.user_id = p.id) AS modules_completed,
      (SELECT COUNT(*) FROM public.quiz_results qr WHERE qr.user_id = p.id AND qr.passed = TRUE) AS quizzes_passed,
      (SELECT json_agg(json_build_object('module_id', qr.module_id, 'score', qr.score, 'percentage', qr.percentage, 'passed', qr.passed, 'submitted_at', qr.submitted_at))
       FROM public.quiz_results qr WHERE qr.user_id = p.id) AS quiz_results,
      (SELECT json_agg(pr.module_id)
       FROM public.progress pr WHERE pr.user_id = p.id) AS completed_modules,
      (SELECT json_agg(su.section_id)
       FROM public.section_unlocks su WHERE su.user_id = p.id) AS unlocked_sections
    FROM public.profiles p
    WHERE p.role = 'student'
    ORDER BY p.created_at DESC
  ) t;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. Admin helper: get invite codes with usage counts
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_get_invite_codes()
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
      ic.code,
      ic.group_name,
      ic.max_uses,
      ic.created_at,
      (SELECT COUNT(*) FROM public.invite_code_uses icu WHERE icu.code = ic.code) AS use_count,
      (SELECT json_agg(json_build_object('user_id', icu.user_id, 'used_at', icu.used_at,
        'full_name', (SELECT full_name FROM public.profiles WHERE id = icu.user_id),
        'email', (SELECT email FROM public.profiles WHERE id = icu.user_id)))
       FROM public.invite_code_uses icu WHERE icu.code = ic.code) AS users
    FROM public.invite_codes ic
    ORDER BY ic.created_at DESC
  ) t;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
