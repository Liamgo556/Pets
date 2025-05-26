/*
  # PetPals Adoption Platform – Secure Initial Schema (Admin-only enforcement)

  Tables:
    - pets
    - user_preferences
    - user_push_tokens
    - announcements

  Storage:
    - pet-images bucket

  RLS:
    - Only admins can manage pets, images, announcements
    - Authenticated users manage their own preferences and push tokens
*/

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  age_unit text NOT NULL CHECK (age_unit IN ('days', 'months', 'years')),
  type text NOT NULL CHECK (type IN ('dog', 'cat', 'other')),
  is_friendly boolean NOT NULL DEFAULT false,
  image_url text NOT NULL,
  description text NOT NULL,
  contact_phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notifications_new_pets boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user push tokens table
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  push_token text NOT NULL,
  device_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_used timestamptz DEFAULT now(),
  UNIQUE(user_id, push_token)
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  user_id uuid primary key references auth.users(id)
);

create table IF NOT EXISTS user_favorites (
  user_id uuid references auth.users on delete cascade,
  pet_id uuid references pets(id) on delete cascade,
  primary key (user_id, pet_id)
);

-- Enable RLS on all tables
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;


-- ✅ Pets RLS
CREATE POLICY "Anyone can view pets" 
  ON pets FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert pets" 
  ON pets FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update pets" 
  ON pets FOR UPDATE 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete pets" 
  ON pets FOR DELETE 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin');

-- ✅ User Preferences RLS
CREATE POLICY "Users can view their own preferences" 
  ON user_preferences FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON user_preferences FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON user_preferences FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- ✅ User Push Tokens RLS
CREATE POLICY "Users can view their own push tokens" 
  ON user_push_tokens FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push tokens" 
  ON user_push_tokens FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push tokens" 
  ON user_push_tokens FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push tokens" 
  ON user_push_tokens FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- ✅ Announcements RLS
CREATE POLICY "Anyone can view announcements" 
  ON announcements FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can manage announcements" 
  ON announcements FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "User can access their own favorites" 
ON user_favorites FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ✅ Create public bucket for pet images
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-images', 'pet-images', true)
ON CONFLICT (id) DO NOTHING;

-- ✅ Storage Policies for 'pet-images'
-- Public read-only access
CREATE POLICY "Public can read pet images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-images');

-- Admin-only upload
CREATE POLICY "Only admins can upload pet images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'pet-images' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- Admin-only update
CREATE POLICY "Only admins can update pet images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'pet-images' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- Admin-only delete
CREATE POLICY "Only admins can delete pet images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pet-images' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- ✅ Timestamp triggers
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers on relevant tables
CREATE TRIGGER set_timestamp_pets
BEFORE UPDATE ON pets
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER set_timestamp_user_preferences
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER set_timestamp_announcements
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();
