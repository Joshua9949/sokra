ALTER TABLE public.sokra_users ADD COLUMN IF NOT EXISTS lesson_zero_seen boolean NOT NULL DEFAULT false;
ALTER TABLE public.sokra_users ADD COLUMN IF NOT EXISTS onboarding_overlay_seen boolean NOT NULL DEFAULT false;
ALTER TABLE public.sokra_credentials ADD COLUMN IF NOT EXISTS quality_descriptor text;