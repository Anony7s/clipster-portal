
-- This function safely increments the view count for a clip
CREATE OR REPLACE FUNCTION increment_view_count(clip_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.clips
  SET views = COALESCE(views, 0) + 1
  WHERE id = clip_id;
END;
$$;
