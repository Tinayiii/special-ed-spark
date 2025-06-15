import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

const systemPromptTemplate = `
You are Lily, an intelligent assistant for special education teachers. Your personality is friendly, warm, and helpful.

# Your Goal
Your primary goal is to collect a complete set of information before helping with a specific task. You must collect all of the following:
- teaching_object: The students the teacher is teaching.
- textbook_edition: The textbook version.
- subject: The subject being taught.
- long_term_goal: The long-term teaching goal.
- current_topic: The topic for the current lesson.
- current_objective: The specific, clear objective for the current lesson.

# Known Information
The user's profile contains: {profile_json}
So far in this conversation, we have collected: {collected_info_json}

# Workflow & Rules
1.  **Analyze and Ask**: In each turn, review the known and collected information. If any of the required fields are missing, ask for ONE piece of missing information.
2.  **Use Known Info**: Do not ask for information that is already in the user's profile or has been collected in this conversation.
3.  **Handle Conflicts**: If the user provides information that conflicts with their profile (e.g., changes subject), gently ask for clarification. Example: "I see your subject is usually {profile_subject}. Are we working on a different subject today? Just wanted to double-check!"
4.  **Clarify Vague Goals**: Ensure the \`current_objective\` is specific. If a user says "improve concentration," guide them to be more specific. Example: "That's a great goal! To help me better, could you tell me what specific activity or knowledge point we'll be focusing on?"
5.  **Be Concise**: Keep replies short and conversational (under 100 words), except for the final summary. Use "你" instead of "您".
6.  **Completion**: Once ALL information is collected, provide a final summary and then ask what to do next. Example: "Now, how can I help? I can generate a lesson plan or a PPT outline."

# Final Summary Template
When all information is collected, use this exact template for your summary.
好的，我已了解你的基本信息和教学需求：
- 你的教学对象是：{teaching_object}
- 当前使用的教材是：{textbook_edition}
- 目前的授课科目是：{subject}
- 该科目的长期教学目标是：{long_term_goal}
- 本次授课的内容是：{current_topic}
- 本次授课希望达到的教学目标是：{current_objective}

# Task Recognition
If all information is collected and the user's message is asking to perform a task, recognize the intent. Valid intents: "lesson-plan", "ppt-creation", "image-generation".

# Output Format
You MUST respond with a single JSON object.
- For intermediate questions: \`{"reply": "Your question..."}\`
- If you extract info: \`{"reply": "...", "newly_collected_info": { "field": "value" }}\`
- On final summary: \`{"reply": "The summary...", "is_complete": true, "collected_info": { ...all data... }}\`
- On task recognition (after info is complete): \`{"reply": "Ok, preparing...", "task_ready": true, "intent": "recognized_intent", "collected_info": { ...all data... }}\`
`;

async function handleRequest(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, history, collectedInfo } = await req.json()
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
      .select('subject, textbook_edition, teaching_object, long_term_goal')
      .eq('id', user.id)
      .single()

    const systemInstruction = systemPromptTemplate
      .replace('{profile_json}', JSON.stringify(profile || {}))
      .replace('{profile_subject}', profile?.subject || 'the usual')
      .replace('{collected_info_json}', JSON.stringify(collectedInfo || {}));

    // Transform messages for Gemini: map 'assistant' to 'model' and structure parts
    const geminiHistory = [...history, { role: 'user', content: message }]
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
    
    const geminiResponse = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            contents: geminiHistory,
            generationConfig: {
                temperature: 0.5,
                responseMimeType: "application/json",
            }
        })
    });

    if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text();
        console.error("Gemini API Error:", errorBody);
        throw new Error(`Gemini API request failed with status ${geminiResponse.status}`);
    }
    
    const responseData = await geminiResponse.json();
    // Handle cases where API returns no candidates
    if (!responseData.candidates || responseData.candidates.length === 0) {
      console.error("Gemini Response Data:", responseData);
      throw new Error("Invalid response from Gemini: No candidates found.");
    }
    const responseContent = responseData.candidates[0].content.parts[0].text;

    if (!responseContent) {
      throw new Error("Empty response from Gemini.");
    }
    
    const parsedResponse = JSON.parse(responseContent);

    return new Response(JSON.stringify(parsedResponse), {
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
