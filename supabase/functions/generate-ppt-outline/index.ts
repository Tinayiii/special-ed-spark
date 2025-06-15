
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, subject, textbook_edition } = await req.json();

    const systemInstruction = `You are an expert in creating PowerPoint presentation outlines for special education teachers.
The user teaches ${subject} using the ${textbook_edition} textbook.
Generate a clear, structured PPT outline based on the user's request.
The outline should have a title, and a list of slides with titles and bullet points.
Format the output in Markdown.`;

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            contents: [{
                role: 'user',
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "text/plain",
            }
        })
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
    }

    const responseData = await response.json();
    const pptOutline = responseData.candidates[0].content.parts[0].text;

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
