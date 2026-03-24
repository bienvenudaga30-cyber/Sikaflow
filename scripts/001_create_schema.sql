-- =============================================================================
-- Sika FLOW — Schéma Supabase complet (profils, transactions, clés API, devices)
-- =============================================================================
--
-- IMPORTANT — Deux modèles possibles (ne pas appliquer les deux sur la même DB
-- sans migration manuelle) :
--
--   A) Persistance API « simple » (service role, ids text, tenant text) :
--      → supabase/migrations/20250324120000_sikaflow_transactions.sql
--
--   B) Application avec Auth Supabase + dashboard (ce fichier) :
--      UUID, RLS par utilisateur, tables api_keys / devices.
--
-- Exécution : Supabase → SQL Editor (rôle avec droits sur auth).
-- Réexécution : le script est idempotent (DROP POLICY IF EXISTS, etc.).
--
-- PostgreSQL 14+ / Supabase : EXECUTE FUNCTION pour les triggers.
-- =============================================================================

-- 1. Profils (liés à auth.users)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Profil automatique à l’inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Transactions Mobile Money
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sikaflow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operator TEXT NOT NULL CHECK (operator IN ('mtn', 'moov', 'celtiis')),
  type TEXT NOT NULL CHECK (type IN ('received', 'sent', 'payment', 'withdrawal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending')),
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  reference TEXT NOT NULL,
  counterparty TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_sms TEXT NOT NULL,
  external_ref TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sikaflow_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_own" ON public.sikaflow_transactions;
DROP POLICY IF EXISTS "transactions_insert_own" ON public.sikaflow_transactions;
DROP POLICY IF EXISTS "transactions_update_own" ON public.sikaflow_transactions;
DROP POLICY IF EXISTS "transactions_delete_own" ON public.sikaflow_transactions;

CREATE POLICY "transactions_select_own" ON public.sikaflow_transactions
  FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "transactions_insert_own" ON public.sikaflow_transactions
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "transactions_update_own" ON public.sikaflow_transactions
  FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "transactions_delete_own" ON public.sikaflow_transactions
  FOR DELETE USING (auth.uid() = tenant_id);

CREATE INDEX IF NOT EXISTS idx_transactions_tenant_id ON public.sikaflow_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_received_at ON public.sikaflow_transactions(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_operator ON public.sikaflow_transactions(operator);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.sikaflow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.sikaflow_transactions(reference);

-- 3. Clés API
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read:transactions'],
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, key_prefix)
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "api_keys_select_own" ON public.api_keys;
DROP POLICY IF EXISTS "api_keys_insert_own" ON public.api_keys;
DROP POLICY IF EXISTS "api_keys_update_own" ON public.api_keys;
DROP POLICY IF EXISTS "api_keys_delete_own" ON public.api_keys;

CREATE POLICY "api_keys_select_own" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "api_keys_insert_own" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "api_keys_update_own" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "api_keys_delete_own" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);

-- 4. Appareils (gateways)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  device_id TEXT NOT NULL,
  operators TEXT[] NOT NULL DEFAULT ARRAY['mtn']::text[],
  is_active BOOLEAN DEFAULT TRUE,
  last_ping_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, device_id)
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "devices_select_own" ON public.devices;
DROP POLICY IF EXISTS "devices_insert_own" ON public.devices;
DROP POLICY IF EXISTS "devices_update_own" ON public.devices;
DROP POLICY IF EXISTS "devices_delete_own" ON public.devices;

CREATE POLICY "devices_select_own" ON public.devices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "devices_insert_own" ON public.devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "devices_update_own" ON public.devices
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "devices_delete_own" ON public.devices
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON public.devices(device_id);

-- 5. Trigger updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.sikaflow_transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.sikaflow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_devices_updated_at ON public.devices;
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
