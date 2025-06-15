
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
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A clear, simple, and friendly illustration for a special education context. The style should be minimalist and child-friendly. ${prompt}`,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    const image_b64 = response.data[0].b64_json;

    return new Response(JSON.stringify({ image: `data:image/png;base64,${image_b64}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
