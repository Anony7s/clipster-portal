
-- Create a storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create a policy to allow anyone to download from the avatars bucket
CREATE POLICY "Anyone can download avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- Create a policy to allow authenticated users to upload to the avatars bucket
CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Create a policy to allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = owner);

-- Create a policy to allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = owner);
