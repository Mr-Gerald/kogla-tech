-- ==============================================================================
-- KOGLA TECH GLOBAL - COMPLETE POSTGRESQL DATABASE SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/venvcnrqcafizslpwail/sql/new
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  xp INTEGER DEFAULT 0,
  completed_rooms JSONB DEFAULT '[]'::jsonb,
  saved_courses JSONB DEFAULT '[]'::jsonb,
  enrolled_courses JSONB DEFAULT '[]'::jsonb,
  phone TEXT,
  bio TEXT,
  github TEXT,
  linkedin TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AFFILIATES & AMBASSADORS TABLE
CREATE TABLE IF NOT EXISTS public.affiliates (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  partner_type TEXT DEFAULT 'ambassador',
  instagram_handle TEXT,
  bio_link_required BOOLEAN DEFAULT true,
  bio_link_status TEXT DEFAULT 'active',
  tier1_rate NUMERIC DEFAULT 6,
  tier2_rate NUMERIC DEFAULT 10,
  student_discount_rate NUMERIC DEFAULT 5,
  escalator_threshold INTEGER DEFAULT 3,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  total_clicks INTEGER DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  total_confirmed INTEGER DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REFERRALS & LEADS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
  id TEXT PRIMARY KEY,
  lead_name TEXT NOT NULL,
  lead_email TEXT,
  lead_phone TEXT,
  course_id TEXT,
  course_name TEXT,
  format TEXT,
  price NUMERIC DEFAULT 0,
  discount_applied NUMERIC DEFAULT 0,
  final_price NUMERIC DEFAULT 0,
  promo_code TEXT,
  partner_name TEXT,
  status TEXT DEFAULT 'pending',
  commission_amount NUMERIC DEFAULT 0,
  commission_tier INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- 4. CERTIFICATES REGISTRY TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_email TEXT,
  course_title TEXT NOT NULL,
  cohort_name TEXT,
  grade TEXT,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  credential_url TEXT,
  status TEXT DEFAULT 'valid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT,
  rating INTEGER DEFAULT 5,
  track_id TEXT,
  track_title TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SYSTEM NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROJECT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_type TEXT,
  budget_range TEXT,
  timeline TEXT,
  project_scope TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for application clients
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public Read Affiliates" ON public.affiliates FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Affiliates" ON public.affiliates FOR ALL USING (true);

CREATE POLICY "Public Read Referrals" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Referrals" ON public.referrals FOR ALL USING (true);

CREATE POLICY "Public Read Certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Certificates" ON public.certificates FOR ALL USING (true);

CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Reviews" ON public.reviews FOR ALL USING (true);

CREATE POLICY "Public Read Notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Notifications" ON public.notifications FOR ALL USING (true);

CREATE POLICY "Public Read Inquiries" ON public.inquiries FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Inquiries" ON public.inquiries FOR ALL USING (true);
