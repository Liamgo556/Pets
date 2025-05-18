/*
  # Initial schema for PetPals Adoption Platform

  1. New Tables
    - `pets` - Stores all pet information for adoption
    - `user_preferences` - Stores user notification preferences
    - `user_push_tokens` - Stores device push notification tokens
    - `announcements` - Stores system announcements
  
  2. Security
    - Enable RLS on all tables
    - Add policies for appropriate access control
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

-- Enable Row Level Security (RLS)
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pets
CREATE POLICY "Anyone can view pets" 
  ON pets FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert pets" 
  ON pets FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pets" 
  ON pets FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete pets" 
  ON pets FOR DELETE 
  TO authenticated 
  USING (true);

-- RLS Policies for user_preferences
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

-- RLS Policies for user_push_tokens
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

-- RLS Policies for announcements
CREATE POLICY "Anyone can view announcements" 
  ON announcements FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage announcements" 
  ON announcements FOR ALL 
  TO authenticated 
  USING (true);

-- Create storage buckets for pet images
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-images', 'pet-images', true);

-- Set up storage policy to allow public read access to pet images
CREATE POLICY "Public can read pet images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-images');

-- Allow authenticated users to upload pet images
CREATE POLICY "Authenticated users can upload pet images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pet-images');

-- Allow authenticated users to update pet images
CREATE POLICY "Authenticated users can update pet images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'pet-images');

-- Allow authenticated users to delete pet images
CREATE POLICY "Authenticated users can delete pet images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'pet-images');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at columns
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