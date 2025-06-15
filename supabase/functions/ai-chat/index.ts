
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from "https://deno.land/x/openai/mod.ts";
import { corsHeaders } from '../_shared/cors.ts'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

// Function to get intent from LLM
async function getIntentFromLlm(message: string): Promise<string> {
  const prompt = `Based on the user's message, what is their primary intent? Respond with only one of the following JSON-compatible strings: "lesson-plan", "image-generation", "ppt-outline", or "unknown".\n\nUser message: "${message}"\n\nIntent:`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: "You are an expert at classifying user intent." }, { role: 'user', content: prompt }],
      model: 'gpt-4o-mini',
      temperature: 0.1,
      max_tokens: 20,
    });

    const intent = chatCompletion.choices[0].message.content?.trim().replace(/"/g, '') || 'unknown';
    console.log(`LLM recognized intent: ${intent}`);
    const validIntents = ["lesson-plan", "image-generation", "ppt-outline", "unknown"];
    if (validIntents.includes(intent)) {
        return intent;
    }
    return 'unknown';
  } catch (error) {
    console.error('Error getting intent from LLM:', error);
    return 'unknown';
  }
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
      response = { next_question: 'subject', reply: "为了给您提供更个性化的帮助，我需要了解一些信息。请问您主要教授什么科目？" };
    } else if (!profile?.textbook_edition) {
      response = { next_question: 'textbook_edition', reply: `好的，我记下了您教的科目是${profile.subject}。请问您使用的教材是哪个版本的？` };
    } else {
      const intent = await getIntentFromLlm(message);
      
      let reply = '';
      switch (intent) {
        case 'lesson-plan':
          reply = `好的，我明白了。您想让我帮您创建一个教案。请告诉我关于这个教案的更多细节，例如课题、年级和教学目标。`;
          break;
        case 'image-generation':
          reply = `好的，您想生成一张图片。请详细描述一下您想看到的画面。`;
          break;
        case 'ppt-outline':
          reply = `好的，您需要一个PPT大纲。请告诉我PPT的主题和主要内容点。`;
          break;
        default:
          const chatCompletion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: `You are a helpful teaching assistant for special education. The user's profile: subject is ${profile.subject}, textbook is ${profile.textbook_edition}. Keep your answers concise and helpful.` },
                { role: 'user', content: message }
            ],
            model: 'gpt-4o-mini',
          });
          reply = chatCompletion.choices[0].message.content || "抱歉，我不太明白您的意思，可以再说一遍吗？";
          break;
      }
      
      response = { intent: intent, reply: reply };
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
