-- ============================================================
-- SHOOTLY DATABASE SCHEMA
-- Paste this entire file into the Supabase SQL editor and run it
-- ============================================================

-- Profiles (one per user, extends Supabase auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'client',  -- 'client', 'creator', 'admin'
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator profiles
CREATE TABLE IF NOT EXISTS creators (
  id UUID REFERENCES profiles ON DELETE CASCADE PRIMARY KEY,
  status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
  bio TEXT,
  specialty TEXT,
  location TEXT,
  travel_miles INTEGER DEFAULT 25,
  response_time TEXT DEFAULT '< 2 hours',
  projects_completed INTEGER DEFAULT 0,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator specialty tags
CREATE TABLE IF NOT EXISTS creator_specialties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- Creator equipment list
CREATE TABLE IF NOT EXISTS creator_equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- Portfolio photos
CREATE TABLE IF NOT EXISTS portfolio_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages (services a creator offers)
CREATE TABLE IF NOT EXISTS packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked/unavailable dates
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, blocked_date)
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles ON DELETE CASCADE,
  creator_id UUID REFERENCES creators ON DELETE CASCADE,
  package_id UUID REFERENCES packages ON DELETE SET NULL,
  event_date DATE,
  status TEXT DEFAULT 'pending',  -- 'pending', 'confirmed', 'completed', 'cancelled'
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations (one per client+creator pair)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles ON DELETE CASCADE,
  creator_id UUID REFERENCES creators ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, creator_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );

  -- If signing up as creator, create creator row too
  IF NEW.raw_user_meta_data->>'role' = 'creator' THEN
    INSERT INTO creators (id, specialty, location)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'specialty',
      NEW.raw_user_meta_data->>'location'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, only edit their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Creators: approved creators are public, pending only visible to owner/admin
CREATE POLICY "Approved creators viewable by all" ON creators FOR SELECT USING (status = 'approved' OR auth.uid() = id);
CREATE POLICY "Creators can update own profile" ON creators FOR UPDATE USING (auth.uid() = id);

-- Portfolio photos: public read, owner write
CREATE POLICY "Portfolio photos viewable by all" ON portfolio_photos FOR SELECT USING (true);
CREATE POLICY "Creators manage own photos" ON portfolio_photos FOR ALL USING (auth.uid() = creator_id);

-- Packages: public read, owner write
CREATE POLICY "Packages viewable by all" ON packages FOR SELECT USING (true);
CREATE POLICY "Creators manage own packages" ON packages FOR ALL USING (auth.uid() = creator_id);

-- Specialties and equipment: public read, owner write
CREATE POLICY "Specialties viewable by all" ON creator_specialties FOR SELECT USING (true);
CREATE POLICY "Creators manage own specialties" ON creator_specialties FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Equipment viewable by all" ON creator_equipment FOR SELECT USING (true);
CREATE POLICY "Creators manage own equipment" ON creator_equipment FOR ALL USING (auth.uid() = creator_id);

-- Blocked dates: public read, owner write
CREATE POLICY "Blocked dates viewable by all" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Creators manage own blocked dates" ON blocked_dates FOR ALL USING (auth.uid() = creator_id);

-- Bookings: visible to client or creator involved
CREATE POLICY "Bookings visible to participants" ON bookings FOR SELECT USING (auth.uid() = client_id OR auth.uid() = creator_id);
CREATE POLICY "Clients can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Participants can update bookings" ON bookings FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = creator_id);

-- Conversations: visible to participants
CREATE POLICY "Conversations visible to participants" ON conversations FOR SELECT USING (auth.uid() = client_id OR auth.uid() = creator_id);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = creator_id);

-- Messages: visible to conversation participants
CREATE POLICY "Messages visible to participants" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.client_id = auth.uid() OR c.creator_id = auth.uid()))
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can mark messages read" ON messages FOR UPDATE USING (auth.uid() = sender_id OR
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.client_id = auth.uid() OR c.creator_id = auth.uid()))
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- ============================================================
-- SEED ADMIN USER (run after signing up with your email)
-- Replace 'colehuntz6@gmail.com' with your actual email
-- ============================================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'colehuntz6@gmail.com';
