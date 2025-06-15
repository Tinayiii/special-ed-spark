
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'));

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompts } = await req.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return new Response(JSON.stringify({ error: 'Prompts array is required' }), { status: 400 });
    }

    console.log('Generating images with Hugging Face for prompts:', prompts);

    const imageGenerationPromises = prompts.map(async (p: string) => {
      try {
        const enhancedPrompt = `A clear, simple, and friendly illustration for a special education context. The style should be minimalist and child-friendly. ${p}`;
        
        const image = await hf.textToImage({
          inputs: enhancedPrompt,
          model: 'black-forest-labs/FLUX.1-schnell',
        });

        // Convert the blob to a base64 string
        const arrayBuffer = await image.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        return `data:image/png;base64,${base64}`;
      } catch (error) {
        console.error('Error generating image for prompt:', p, error);
        return null;
      }
    });
    
    const images_b64 = await Promise.all(imageGenerationPromises);
    const validImages = images_b64.filter(img => img !== null);

    if (validImages.length === 0) {
      throw new Error('Failed to generate any images');
    }

    // Upload to Supabase Storage
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const uploadPromises = validImages.map((base64Data, index) => {
      if (!base64Data) return Promise.resolve({ error: { message: 'Empty base64 string' }, data: null });
      
      const imageName = `img_${Date.now()}_${index}.png`;
      
      // Extract base64 data (remove data:image/png;base64, prefix)
      const base64String = base64Data.split(',')[1];
      const imageBuffer = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
      
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

    console.log('Successfully generated and uploaded', urls.length, 'images');

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
