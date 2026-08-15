
-- Users (wallet-keyed)
CREATE TABLE public.sokra_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL UNIQUE,
  username text,
  notification_enabled boolean NOT NULL DEFAULT false,
  notification_time text,
  theme_preference text NOT NULL DEFAULT 'dark',
  onboarding_complete boolean NOT NULL DEFAULT false,
  first_credential_earned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sokra_users_wallet_idx ON public.sokra_users (lower(wallet_address));

-- Conversations
CREATE TABLE public.sokra_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  subject text NOT NULL,
  message_count integer NOT NULL DEFAULT 0,
  credential_count integer NOT NULL DEFAULT 0,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (wallet_address, subject)
);
CREATE INDEX sokra_conv_wallet_idx ON public.sokra_conversations (lower(wallet_address));

-- Messages
CREATE TABLE public.sokra_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.sokra_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','sokra')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sokra_messages_conv_idx ON public.sokra_messages (conversation_id, created_at);

-- Credentials (soulbound)
CREATE TABLE public.sokra_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  subject text NOT NULL,
  name text NOT NULL,
  area text NOT NULL,
  excerpt text NOT NULL,
  insight text NOT NULL,
  is_master boolean NOT NULL DEFAULT false,
  genlayer_tx_hash text,
  contract_address text,
  earned_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sokra_cred_wallet_idx ON public.sokra_credentials (lower(wallet_address));

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.sokra_users TO anon, authenticated;
GRANT ALL ON public.sokra_users TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.sokra_conversations TO anon, authenticated;
GRANT ALL ON public.sokra_conversations TO service_role;
GRANT SELECT, INSERT ON public.sokra_messages TO anon, authenticated;
GRANT ALL ON public.sokra_messages TO service_role;
GRANT SELECT, INSERT ON public.sokra_credentials TO anon, authenticated;
GRANT ALL ON public.sokra_credentials TO service_role;

-- RLS — permissive for Phase 2 (wallet signature verification TBD).
ALTER TABLE public.sokra_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read users" ON public.sokra_users FOR SELECT USING (true);
CREATE POLICY "public write users" ON public.sokra_users FOR INSERT WITH CHECK (true);
CREATE POLICY "public update users" ON public.sokra_users FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE public.sokra_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read conv" ON public.sokra_conversations FOR SELECT USING (true);
CREATE POLICY "public write conv" ON public.sokra_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "public update conv" ON public.sokra_conversations FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE public.sokra_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read messages" ON public.sokra_messages FOR SELECT USING (true);
CREATE POLICY "public write messages" ON public.sokra_messages FOR INSERT WITH CHECK (true);

ALTER TABLE public.sokra_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read creds" ON public.sokra_credentials FOR SELECT USING (true);
CREATE POLICY "public write creds" ON public.sokra_credentials FOR INSERT WITH CHECK (true);
