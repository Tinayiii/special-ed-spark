
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

    const systemPrompt = `You are an expert in creating PowerPoint presentation outlines for special education teachers.
The user teaches ${subject} using the ${textbook_edition} textbook.
Generate a clear, structured PPT outline based on the user's request.
The outline should have a title, and a list of slides with titles and bullet points.
Format the output in Markdown.`;

    const chatCompletion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        model: 'gpt-4o-mini',
    });

    const pptOutline = chatCompletion.choices[0].message.content;

    return new Response(JSON.stringify({ pptOutline }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating PPT outline:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
