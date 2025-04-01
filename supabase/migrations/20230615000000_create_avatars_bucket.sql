
-- Create the 'avatars' storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Set up security policies
CREATE POLICY "Avatar images are publicly accessible." 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars." 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own avatars." 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own avatars." 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'avatars' AND auth.uid() = owner);
