
-- Step 1: Create Profiles table to store user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY, -- Removed reference to auth.users to be handled in app logic
  display_name TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Stores public user profile information. The id should correspond to auth.users.id.';

-- Step 2: Create Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT '新对话',
  intent TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  collected_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.conversations IS 'Stores chat conversation sessions.';

-- Step 3: Create Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  lesson_plan_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.messages IS 'Stores individual messages for each conversation.';

-- Step 4: Create Teaching Resources table
CREATE TABLE public.teaching_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('lesson_plan', 'image')),
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
COMMENT ON TABLE public.teaching_resources IS 'Stores generated resources like lesson plans and images.';

-- Add foreign key from messages to teaching_resources
ALTER TABLE public.messages
ADD CONSTRAINT fk_lesson_plan
FOREIGN KEY (lesson_plan_id)
REFERENCES public.teaching_resources(id) ON DELETE SET NULL;

-- Step 5: Enable Row Level Security (RLS) for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_resources ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
-- Profiles: Users can view all profiles, but only create/update their own.
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Conversations: Users can only manage their own conversations.
CREATE POLICY "Users can manage their own conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id);

-- Messages: Users can only manage messages in conversations they have access to.
CREATE POLICY "Users can manage messages in their conversations" ON public.messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = messages.conversation_id AND user_id = auth.uid()
  )
);

-- Teaching Resources: Users can manage their own resources.
CREATE POLICY "Users can manage their own teaching resources" ON public.teaching_resources FOR ALL USING (auth.uid() = user_id);

-- Step 7: Create Indexes for performance optimization
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_teaching_resources_user_id ON public.teaching_resources(user_id);
