-- ── Migration v4 : table posts + storage post-images ─────────────

-- Table posts (remplace le tableau posts dans app_config)
CREATE TABLE IF NOT EXISTS public.posts (
  id            TEXT PRIMARY KEY,
  iso           DATE NOT NULL,
  "publishAt"   TIMESTAMPTZ,
  "dateShort"   TEXT NOT NULL DEFAULT '',
  "dateLong"    TEXT NOT NULL DEFAULT '',
  titre         TEXT NOT NULL,
  author        TEXT NOT NULL DEFAULT 'Intendance · LBN4E',
  "imageKind"   TEXT NOT NULL DEFAULT 'manuscrit',
  "imageUrl"    TEXT,
  "noImage"     BOOLEAN NOT NULL DEFAULT false,
  "youtubeUrl"  TEXT,
  tags          JSONB NOT NULL DEFAULT '[]',
  paragraphes   JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS sur posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts public read" ON public.posts;
CREATE POLICY "Posts public read" ON public.posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Posts admin write" ON public.posts;
CREATE POLICY "Posts admin write" ON public.posts
  FOR ALL USING (true);

-- Realtime sur posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- Bucket de stockage pour les images des posts
INSERT INTO storage.buckets (id, name, public)
  VALUES ('post-images', 'post-images', true)
  ON CONFLICT (id) DO NOTHING;

-- RLS storage
DROP POLICY IF EXISTS "Images public read" ON storage.objects;
CREATE POLICY "Images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "Images upload" ON storage.objects;
CREATE POLICY "Images upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'post-images');

DROP POLICY IF EXISTS "Images delete" ON storage.objects;
CREATE POLICY "Images delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'post-images');

-- Migrer les posts existants depuis app_config vers la nouvelle table
INSERT INTO public.posts (
  id, iso, "publishAt", "dateShort", "dateLong",
  titre, author, "imageKind", "imageUrl", "noImage",
  "youtubeUrl", tags, paragraphes
)
SELECT
  p->>'id',
  (p->>'iso')::DATE,
  NULLIF(p->>'publishAt', '')::TIMESTAMPTZ,
  COALESCE(p->>'dateShort', ''),
  COALESCE(p->>'dateLong', ''),
  p->>'titre',
  COALESCE(NULLIF(p->>'author', ''), 'Intendance · LBN4E'),
  COALESCE(NULLIF(p->>'imageKind', ''), 'manuscrit'),
  NULLIF(p->>'imageUrl', ''),
  COALESCE((p->>'noImage')::BOOLEAN, false),
  NULLIF(p->>'youtubeUrl', ''),
  COALESCE(p->'tags', '[]'::jsonb),
  COALESCE(p->'paragraphes', '[]'::jsonb)
FROM app_config,
  jsonb_array_elements(data->'posts') AS p
WHERE id = 1
  AND data->'posts' IS NOT NULL
  AND jsonb_array_length(data->'posts') > 0
ON CONFLICT (id) DO NOTHING;

-- Nettoyer les posts du blob app_config
UPDATE app_config
  SET data = data - 'posts', updated_at = now()
  WHERE id = 1;
