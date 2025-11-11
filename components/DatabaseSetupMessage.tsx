import React from 'react';

const SCRIPT = `-- This script sets up the necessary tables and policies for the Trading Toolkit.
-- Run this entire script in your Supabase project's SQL Editor to initialize the database.

-- 1. Trades Table
-- Stores individual trade plans and outcomes.
CREATE TABLE public.trades (
  id text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  trade_data jsonb NULL,
  CONSTRAINT trades_pkey PRIMARY KEY (id, user_id),
  CONSTRAINT trades_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own trades." ON public.trades FOR ALL USING (auth.uid() = user_id);
COMMENT ON TABLE public.trades IS 'Stores individual trade plans and their outcomes.';

-- 2. Settings Table
-- Stores user-specific application settings.
CREATE TABLE public.settings (
  user_id uuid NOT NULL,
  updated_at timestamp with time zone NULL DEFAULT now(),
  theme text NULL DEFAULT 'dark'::text,
  base_currency text NULL DEFAULT 'USD'::text,
  default_risk_percent numeric NULL DEFAULT 1,
  ai_enabled boolean NULL DEFAULT true,
  api_key text NULL,
  trading_rules jsonb NULL,
  loss_recovery_protocol jsonb NULL,
  routine jsonb NULL,
  CONSTRAINT settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings." ON public.settings FOR ALL USING (auth.uid() = user_id);
COMMENT ON TABLE public.settings IS 'Stores user-specific application settings.';

-- 3. Portfolio Table
-- Stores user's asset holdings.
CREATE TABLE public.portfolio (
  user_id uuid NOT NULL,
  asset_id text NOT NULL,
  name text NULL,
  quantity numeric NOT NULL,
  avg_buy_price numeric NOT NULL,
  current_price numeric NULL,
  CONSTRAINT portfolio_pkey PRIMARY KEY (user_id, asset_id),
  CONSTRAINT portfolio_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own portfolio." ON public.portfolio FOR ALL USING (auth.uid() = user_id);
COMMENT ON TABLE public.portfolio IS 'Stores user''s asset holdings.';

-- 4. Strategies Table
-- Stores backtesting strategy sheets.
CREATE TABLE public.strategies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  description text NULL,
  pair text NULL,
  timeframe text NULL,
  initial_capital numeric NOT NULL,
  risk_percent numeric NOT NULL,
  tags jsonb NULL,
  trades jsonb NULL,
  CONSTRAINT strategies_pkey PRIMARY KEY (id),
  CONSTRAINT strategies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own strategies." ON public.strategies FOR ALL USING (auth.uid() = user_id);
COMMENT ON TABLE public.strategies IS 'Stores backtesting strategy sheets.';

-- 5. Reflections Table
-- Stores daily mindset and psychology reflections.
CREATE TABLE public.reflections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  date date NOT NULL,
  followed_plan text NULL,
  emotional_state text NULL,
  lessons_learned text NULL,
  CONSTRAINT reflections_pkey PRIMARY KEY (id),
  CONSTRAINT reflections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reflections." ON public.reflections FOR ALL USING (auth.uid() = user_id);
COMMENT ON TABLE public.reflections IS 'Stores daily mindset and psychology reflections.';

-- End of script.
`;

const DatabaseSetupMessage = () => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md my-4" role="alert">
      <p className="font-bold">Database Setup Required</p>
      <p className="mb-4">One or more required database tables are missing. To fix this, please copy the script below and run it in your Supabase project's SQL Editor.</p>
      <div className="relative bg-gray-900 rounded-md p-4 my-2">
        <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors">
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
          <code>{SCRIPT}</code>
        </pre>
      </div>
      <p className="text-xs mt-2">After running the script, please refresh this page.</p>
    </div>
  );
};

export default DatabaseSetupMessage;