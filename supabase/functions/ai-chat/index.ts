
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Placeholder for a function to interact with an LLM
async function callLlm(prompt: string) {
  // In the future, this will call the OpenAI API using the OPENAI_API_KEY
  console.log("Calling LLM with prompt:", prompt);
  // For now, it returns a mock response based on the prompt
  if (prompt.includes("What subject")) {
    return "Please tell me the subject you teach.";
  }
  if (prompt.includes("What textbook edition")) {
    return "Please tell me the textbook edition you use.";
  }
  // Mocking intent recognition
  return "intent-recognized:lesson-plan";
}

async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    const authHeader = req.headers.get('Authorization')!

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subject, textbook_edition')
      .eq('id', user.id)
      .single()

    let response;

    if (!profile?.subject) {
      // Ask for subject
      response = { next_question: 'subject', reply: "为了给您提供更个性化的帮助，我需要了解一些信息。请问您主要教授什么科目？" };
    } else if (!profile?.textbook_edition) {
      // Ask for textbook edition
      response = { next_question: 'textbook_edition', reply: `好的，我记下了您教的科目是${profile.subject}。请问您使用的教材是哪个版本的？` };
    } else {
      // All info collected, proceed with intent recognition
      const intentPrompt = `User message: "${message}". What is the user's intent? (e.g., lesson-plan, image-generation, ppt-outline)`;
      const intentResult = await callLlm(intentPrompt); // Placeholder for actual LLM call
      response = { intent: intentResult, reply: `好的，我明白了。您想让我帮您创建一个${intentResult.split(':')[1]}。我们开始吧！` };
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}

serve(handleRequest)
