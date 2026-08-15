ALTER TABLE public.sokra_credentials
  ADD COLUMN IF NOT EXISTS mint_status text NOT NULL DEFAULT 'minted',
  ADD COLUMN IF NOT EXISTS token_id text,
  ADD COLUMN IF NOT EXISTS quality_score integer;

DO $$ BEGIN
  ALTER TABLE public.sokra_credentials ADD CONSTRAINT sokra_credentials_mint_status_check
    CHECK (mint_status IN ('pending','minting','minted','declined'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

UPDATE public.sokra_credentials SET token_id = 'SKR-' || upper(substr(replace(id::text,'-',''),1,10)) WHERE token_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS sokra_credentials_token_id_idx ON public.sokra_credentials(token_id);

-- public verification: anyone may read minted credentials
DROP POLICY IF EXISTS "Public can verify minted credentials" ON public.sokra_credentials;
CREATE POLICY "Public can verify minted credentials" ON public.sokra_credentials
  FOR SELECT TO anon, authenticated USING (mint_status = 'minted');

GRANT SELECT ON public.sokra_credentials TO anon;