-- Create the conversation_details table
CREATE TABLE public.conversation_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    subject TEXT,
    current_topic TEXT,
    long_term_goal TEXT,
    teaching_object TEXT,
    textbook_edition TEXT,
    current_objective TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_conversation_details_user_id ON public.conversation_details(user_id);
CREATE INDEX idx_conversation_details_conversation_id ON public.conversation_details(conversation_id);

-- Add RLS policies
ALTER TABLE public.conversation_details ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own conversation details
CREATE POLICY "Users can view own conversation details"
ON public.conversation_details
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own conversation details
CREATE POLICY "Users can insert own conversation details"
ON public.conversation_details
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own conversation details
CREATE POLICY "Users can update own conversation details"
ON public.conversation_details
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversation_details_updated_at
    BEFORE UPDATE ON public.conversation_details
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_details_updated_at(); 