
-- ============ Helper: updated_at trigger ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ subscriptions ============
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  reports_limit INT NOT NULL DEFAULT 3,
  reports_used INT NOT NULL DEFAULT 0,
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ reports ============
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  idea TEXT NOT NULL,
  target_market TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_user_id_created_at ON public.reports (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.reports FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON public.reports FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ report_sections ============
CREATE TABLE public.report_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('market', 'competitors', 'risks', 'gtm', 'summary')),
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (report_id, section_type)
);

CREATE INDEX idx_report_sections_report_id ON public.report_sections (report_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_sections TO authenticated;
GRANT ALL ON public.report_sections TO service_role;

ALTER TABLE public.report_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sections of own reports"
  ON public.report_sections FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_sections.report_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert sections into own reports"
  ON public.report_sections FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_sections.report_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can update sections of own reports"
  ON public.report_sections FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_sections.report_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete sections of own reports"
  ON public.report_sections FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.id = report_sections.report_id AND r.user_id = auth.uid()
  ));

CREATE TRIGGER trg_report_sections_updated_at
  BEFORE UPDATE ON public.report_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Auto-create profile + free subscription on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, reports_limit)
  VALUES (NEW.id, 'free', 3)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Bump reports_used when a report is created ============
CREATE OR REPLACE FUNCTION public.increment_reports_used()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
  SET reports_used = reports_used + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reports_after_insert
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.increment_reports_used();
