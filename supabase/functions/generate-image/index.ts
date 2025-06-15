
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import OpenAI from "https://deno.land/x/openai/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";
import { corsHeaders } from '../_shared/cors.ts'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompts } = await req.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return new Response(JSON.stringify({ error: 'Prompts array is required' }), { status: 400 });
    }

    const imageGenerationPromises = prompts.map((p: string) => 
        openai.images.generate({
            model: "dall-e-3",
            prompt: `A clear, simple, and friendly illustration for a special education context. The style should be minimalist and child-friendly. ${p}`,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
        })
    );
    
    const responses = await Promise.all(imageGenerationPromises);
    const images_b64 = responses.map(response => response.data[0].b64_json);

    // Upload to Supabase Storage
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const uploadPromises = images_b64.map((b64_json, index) => {
        if (!b64_json) return Promise.resolve({ error: { message: 'Empty base64 string' }, data: null });
        const imageName = `img_${Date.now()}_${index}.png`;
        const imageBuffer = decode(b64_json);
        
        return supabaseAdmin.storage
          .from('generated_images')
          .upload(imageName, imageBuffer, {
            contentType: 'image/png',
            upsert: false,
          });
    });

    const uploadResults = await Promise.all(uploadPromises);

    const urls = uploadResults.map(result => {
        if (result.error || !result.data) {
            console.error('Upload error:', result.error);
            return null;
        }
        const { data } = supabaseAdmin.storage.from('generated_images').getPublicUrl(result.data.path);
        return data.publicUrl;
    }).filter(url => url !== null);

    return new Response(JSON.stringify({ urls }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating images:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
