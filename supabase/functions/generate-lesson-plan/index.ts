
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, grade, objective, subject, textbook_edition, teaching_object, long_term_goal } = await req.json();

    const systemInstruction = `你是一位专业的特殊教育教案设计专家，具有丰富的教学经验和深厚的教育理论基础。

教学设计原则：
1. 以学生为中心：关注学生的学习需求和认知特点
2. 系统性原则：协调各教学要素以实现教学效果最优化
3. 明确教学目标：结合学科核心素养制定具体可测的目标
4. 可行性原则：结合具体教学环境，选择适当教学策略与方法
5. 反馈调节原则：形成动态反馈机制，及时调整教学策略

教学设计逻辑思路：
首先，进行学习内容分析，了解本节课的学习内容出自哪一本教材、哪一个章节，主要内容包括什么，并考虑实际教学中，为提升学生学科素养需要增加、补充的教学内容。
其次，需要进行学情分析，考虑学生的已有知识与技能、认知发展情况与学习兴趣，为后续教学目标及教学重难点确定、教学方法及策略选择、教学活动设计与作业布置、教学评价方法等奠定基础。

请严格按照以下11个部分的结构设计教案，体现系统性、可操作性、目标导向性与创新性，符合新课标理念，注重培养学生学科核心素养和关键能力：

1. 学习内容分析
2. 学情分析  
3. 教学目标（结合学科核心素养）
4. 教学重难点
5. 教学策略
6. 教学环境及资源准备
7. 教学过程
8. 板书设计
9. 布置作业
10. 教学评价
11. 教学反思

教学过程应包含以下常规流程并突出学生主体活动：
- 游戏导入 直击主题（5 min）
- 启发引导 新知学习（12 min） 
- 实践应用 体验探索（12 min）
- 展示交流 讨论思考（8 min）
- 归纳总结 布置作业（3 min）

用户信息：
- 教学对象：${teaching_object}
- 使用教材：${textbook_edition}
- 授课科目：${subject}
- 长期教学目标：${long_term_goal}

请使用Markdown格式输出，确保每个部分都有清晰的标题和详细的内容。`;

    const userPrompt = `请设计一节面向${grade} ${subject}课程的教案，主题为《${topic}》，本次授课希望达到的教学目标是：${objective}。

要求包含学习内容分析、学情分析、教学目标、教学重难点、教学策略、教学环境与资源准备、详细的教学过程（突出学生主体活动）、板书设计、作业布置、教学评价与反思；教案需体现系统性、可操作性、目标导向性与创新性，符合新课标理念，注重培养学生学科核心素养和关键能力。`;

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            contents: [{
                role: 'user',
                parts: [{ text: userPrompt }]
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
    const lessonPlan = responseData.candidates[0].content.parts[0].text;

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
