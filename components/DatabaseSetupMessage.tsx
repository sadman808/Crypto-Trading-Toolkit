import React from 'react';
import { supabaseUrl } from '../supabaseClient';

const SCRIPT = `-- ===============================================================================================
-- TRADING TOOLKIT SUPABASE SETUP SCRIPT
-- ===============================================================================================
-- This script initializes all necessary tables and security policies for the application.
-- Run this full script in your Supabase project's SQL Editor to get started.
-- This script is safe to run multiple times.

-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- -----------------------------------------------------------------------------------------------
-- 1. SETTINGS TABLE
-- Stores user-specific settings like theme, currency, and AI configurations.
-- -----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  user_id uuid NOT NULL PRIMARY KEY,
  updated_at timestamp with time zone DEFAULT now(),
  theme text DEFAULT 'dark'::text,
  base_currency text DEFAULT 'USD'::text,
  default_risk_percent numeric DEFAULT 1,
  ai_enabled boolean DEFAULT true,
  api_key text,
  trading_rules jsonb,
  loss_recovery_protocol jsonb,
  routine jsonb,
  CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- RLS Policy for Settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own settings." ON public.settings;
CREATE POLICY "Users can manage their own settings." ON public.settings FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------------------------
-- 2. TRADES TABLE
-- Stores all saved trade plans and journal entries.
-- -----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trades (
  id text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  trade_data jsonb,
  PRIMARY KEY (id, user_id),
  CONSTRAINT trades_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- RLS Policy for Trades
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own trades." ON public.trades;
CREATE POLICY "Users can manage their own trades." ON public.trades FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------------------------
-- 3. PORTFOLIO TABLE
-- Stores assets for the portfolio tracker.
-- -----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio (
  user_id uuid NOT NULL,
  asset_id text NOT NULL,
  name text,
  quantity numeric NOT NULL,
  avg_buy_price numeric NOT NULL,
  current_price numeric,
  PRIMARY KEY (user_id, asset_id),
  CONSTRAINT portfolio_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- RLS Policy for Portfolio
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own portfolio." ON public.portfolio;
CREATE POLICY "Users can manage their own portfolio." ON public.portfolio FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------------------------
-- 4. STRATEGIES TABLE
-- Stores backtesting strategy sheets.
-- -----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.strategies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  name text NOT NULL,
  description text,
  pair text,
  timeframe text,
  initial_capital numeric NOT NULL,
  risk_percent numeric NOT NULL,
  tags jsonb,
  trades jsonb,
  CONSTRAINT strategies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- RLS Policy for Strategies
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own strategies." ON public.strategies;
CREATE POLICY "Users can manage their own strategies." ON public.strategies FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------------------------
-- 5. REFLECTIONS TABLE
-- Stores daily mindset journal entries.
-- -----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reflections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  followed_plan text,
  emotional_state text,
  lessons_learned text,
  UNIQUE (user_id, date),
  CONSTRAINT reflections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- RLS Policy for Reflections
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own reflections." ON public.reflections;
CREATE POLICY "Users can manage their own reflections." ON public.reflections FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------------------------
-- 6. COURSES TABLE (EDUCATION HUB)
-- Stores educational courses the user is tracking.
-- -----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  platform text,
  link text,
  category text,
  progress numeric DEFAULT 0,
  created_at timestamp DEFAULT now(),
  CONSTRAINT courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- RLS Policy for Courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own courses." ON public.courses;
CREATE POLICY "Users can manage their own courses." ON public.courses FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------------------------
-- 7. NEW: COURSE VIDEOS TABLE (EDUCATION HUB)
-- Stores videos linked to specific courses.
-- -----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_videos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  title text NOT NULL,
  link text,
  description text,
  "timestamp" text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT course_videos_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE
);
-- RLS Policy for Course Videos
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own course videos." ON public.course_videos;
CREATE POLICY "Users can manage their own course videos." ON public.course_videos FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------------------------
-- 8. NOTES TABLE (EDUCATION HUB) - UPDATED
-- Stores notes related to courses, videos, or personal thoughts.
-- -----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  course_id uuid, -- Made nullable
  video_title text,
  video_link text,
  "timestamp" text,
  note_text text,
  created_at timestamp DEFAULT now(),
  CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT notes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE
);

-- Add new columns if they don't exist
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'course'::text;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS video_id uuid;
-- Make course_id nullable
ALTER TABLE public.notes ALTER COLUMN course_id DROP NOT NULL;
-- Add foreign key for video_id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notes_video_id_fkey') THEN
    ALTER TABLE public.notes ADD CONSTRAINT notes_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.course_videos(id) ON DELETE SET NULL;
  END IF;
END;
$$;
-- RLS Policy for Notes (re-apply to be safe)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own notes." ON public.notes;
CREATE POLICY "Users can manage their own notes." ON public.notes FOR ALL USING (auth.uid() = user_id);


-- -----------------------------------------------------------------------------------------------
-- 9. PLAYBOOK TABLE
-- Stores user's custom trading plays/setups.
-- -----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.playbook (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    name text NOT NULL,
    description text,
    category text,
    tags jsonb,
    CONSTRAINT playbook_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- RLS Policy for Playbook
ALTER TABLE public.playbook ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own playbook." ON public.playbook;
CREATE POLICY "Users can manage their own playbook." ON public.playbook FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------------------------
-- 10. WATCHLIST TABLE
-- Stores symbols and notes for the user's watchlist.
-- -----------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.watchlist (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    symbol text NOT NULL,
    UNIQUE (user_id, symbol),
    notes text,
    CONSTRAINT watchlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
-- RLS Policy for Watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own watchlist." ON public.watchlist;
CREATE POLICY "Users can manage their own watchlist." ON public.watchlist FOR ALL USING (auth.uid() = user_id);

-- --- END OF SCRIPT ---
-- After running, please refresh the application page.
`;

const getProjectId = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        const hostnameParts = urlObj.hostname.split('.');
        if (hostnameParts.length >= 3 && hostnameParts[1] === 'supabase') {
            return hostnameParts[0];
        }
        return null;
    } catch (e) {
        console.error("Could not parse Supabase URL:", e);
        return null;
    }
};


const DatabaseSetupMessage = () => {
  const handleCopy = () => {
    navigator.clipboard.writeText(SCRIPT);
    alert('SQL Script copied to clipboard!');
  };

  const projectId = getProjectId(supabaseUrl);
  const sqlEditorLink = projectId 
      ? `https://app.supabase.com/project/${projectId}/sql/new` 
      : `https://supabase.com/dashboard`;

  return (
    <div className="bg-blue-900/20 border-l-4 border-brand-blue text-blue-200 p-6 rounded-lg my-4 shadow-lg" role="alert">
        <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
                <svg className="h-6 w-6 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7s0 4 8 4 8-4 8-4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v6" />
                </svg>
            </div>
            <div className="ml-4">
                <p className="font-bold text-lg mb-2 text-white">Action Required: Finish Database Setup</p>
                <p className="mb-4">
                    To fix the "table not found" errors and enable all app features, you need to run a quick, one-time setup script in your Supabase project. This will create all the necessary database tables.
                </p>
                <div className="bg-gray-950/50 p-4 rounded-md border border-gray-700">
                    <h3 className="font-semibold text-white mb-3">Your 3-Step Setup Guide:</h3>
                    <ol className="list-decimal list-inside space-y-3">
                        <li>
                            <span className="font-semibold">Open the SQL Editor:</span>
                            <a href={sqlEditorLink} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1.5 font-semibold text-brand-blue hover:text-blue-400 bg-blue-500/20 px-3 py-1 rounded-md transition-colors">
                                Go to Supabase
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        </li>
                        <li>
                            <span className="font-semibold">Copy the Setup Script:</span>
                            <button 
                                onClick={handleCopy}
                                className="ml-2 inline-flex items-center gap-1.5 bg-gray-600 text-white font-bold py-1 px-3 rounded-md hover:bg-gray-500 transition-colors"
                            >
                                Copy Script
                            </button>
                        </li>
                        <li>
                            <span className="font-semibold">Paste the script into the editor and click "Run".</span>
                        </li>
                    </ol>
                </div>
                 <p className="text-sm font-medium mt-4">
                    ✨ After running the script, just <button onClick={() => window.location.reload()} className="font-bold underline hover:text-white">refresh this page</button>. The app will be ready to go!
                </p>
            </div>
        </div>
        <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-blue-300 hover:text-white">Show Full SQL Setup Script</summary>
            <pre className="bg-gray-950 text-gray-300 p-4 rounded-md text-xs overflow-auto max-h-48 mt-2 border border-gray-700">
                <code>{SCRIPT}</code>
            </pre>
        </details>
    </div>
  );
};

export default DatabaseSetupMessage;