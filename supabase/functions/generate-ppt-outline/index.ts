
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, objective, subject, textbook_edition, teaching_object, grade } = await req.json();

    const systemInstruction = `你是一位专业的特殊教育PPT设计专家，具有丰富的课件制作经验和深厚的教学理论基础。

PPT设计原则：
1. 结构化设计：按照固定的页面结构和教学节奏组织内容
2. 视觉化优先：重视图示、动画、图卡等可视化素材的运用
3. 分层教学：面向不同学习能力学生提供差异化讲解方式
4. 教学节奏：严格按照"引入→讲解→练习→复习→总结"的5段式流程
5. 特殊教育适配：考虑特殊学生的认知特点和学习需求

请严格按照以下PPT结构生成大纲：

## 固定结构（必须包含）：
1. 封面页 - 课程标题、副标题、基本信息
2. 目录页 - 章节概览和内容结构
3. 章节分割页 - 各章节起始页
4. 正文页（多页）- 核心教学内容
5. 结尾页 - 课程总结和收尾

## 正文页标准格式：
每页必须包含：
- header：一级标题
- subtitle：二级说明  
- tag：引入/讲解/练习/复习/总结（标明教学环节）
- sections：子模块内容
  - title：子模块标题
  - text：具体描述
  - visual_suggestion：可视化素材建议（图示、动画、图卡等）
  - teaching_tips：分层教学提示（图解 vs 口述等）

## 教学环节分配（严格遵循）：
- 引入环节（5分钟）：激发兴趣，联系生活经验，引导注意力集中
- 讲解环节（12分钟）：核心知识传授，结构清晰，语言简洁
- 练习环节（12分钟）：巩固理解，互动操作，设计选择题、操作题等
- 复习环节（8分钟）：回顾要点，查漏补缺，适合章节中段或课前
- 总结环节（3分钟）：整体梳理，知识建构，思维导图等工具

用户信息：
- 教学对象：${teaching_object}
- 使用教材：${textbook_edition}  
- 授课科目：${subject}

请使用Markdown格式输出，确保每个页面都有清晰的结构和详细的内容规划。`;

    const userPrompt = `请为面向${grade || '学生'} ${subject}课程设计一份专业PPT大纲，主题为《${topic}》，教学目标：${objective}。

要求：
1. 严格按照封面页→目录页→章节分割页→正文页→结尾页的结构
2. 正文页必须覆盖：引入、讲解、练习、复习、总结五个教学环节
3. 每页都要包含可视化素材建议和分层教学提示
4. 内容要体现特殊教育的专业性和实用性
5. 确保时间分配合理，符合课堂教学节奏

请生成完整的PPT大纲，包含具体的页面规划、内容要点和教学策略。`;

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
