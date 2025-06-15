
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import OpenAI from "https://deno.land/x/openai/mod.ts";
import { corsHeaders } from '../_shared/cors.ts'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, subject, textbook_edition } = await req.json();

    const systemPrompt = `You are an expert in creating lesson plans for special education.
The user teaches ${subject} using the ${textbook_edition} textbook.
Generate a detailed lesson plan based on the user's request.
The lesson plan should be structured, clear, and easy to follow.
Format the output in Markdown.`;

    const chatCompletion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        model: 'gpt-4o-mini',
    });

    const lessonPlan = chatCompletion.choices[0].message.content;

    return new Response(JSON.stringify({ lessonPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating lesson plan:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
