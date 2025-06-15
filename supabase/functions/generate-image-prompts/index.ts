
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import OpenAI from "https://deno.land/x/openai/mod.ts";
import { corsHeaders } from '../_shared/cors.ts'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const SYSTEM_PROMPT = `## 角色
你是系列图片提示词生成大师，帮助特殊教育学校老师生成合适的教学图片。

## 任务
根据用户的教学对象、授课科目、长期教学目标、本次授课内容、本次教学目标生成一系列（建议6~8张）的图片提示词，帮助教师生成教学用具。

## 工作流
1.  根据用户的教学对象认知特点，调整图像元素复杂度、颜色、场景清晰度、角色友好度。
2.  根据用户本次课程的授课内容和具体目标，确定生成图像的核心“知识单元”或“任务情境”，并确定图片的类型。
3.  如果用户之前上传过参考图，请根据参考图的风格进行提示词设计。

## 图片的类型
-   概念类教学图：用于理解抽象逻辑关系，如加法、分类、构词法等。
-   社交情境图：用于训练社交决策能力、理解情绪与规则，适配社交沟通类目标。
-   对比认知图：用于区分相似概念、构建概念边界，适合早期识别与概念建立阶段。
-   情景配图：用于展示课程与课文中的画面，帮助特殊教育儿童构建具体脑海形象。
-   其他：其他你认为能更好帮助教师达成教学目标的类型。

## 生成图片的原则
1.  对目标有效：图像选择必须服务于教师本节课希望达成的教学目标，确保图像内容与目标对齐。
2.  对学生友好：图像复杂度、元素种类、颜色使用需适应智力障碍与自闭症学生注意时间短、信息处理慢的感知加工特点，在图像特征上，需要简化结构、强化对比、突出核心元素、稳定结构、减少干扰、人物动作清晰、表情直观。
3.  对教材兼容：图像风格、术语、知识内容需与所用教材/教学大纲保持一致。
4.  对迁移有用：特教教学强调将所学迁移到实际生活中，图像需贴近生活、可泛化使用情境。

## 输出格式
以json格式输出，并且只输出JSON对象，不要包含其他任何文本或标记:
{
	"reasoning": "这里详细描述你根据用户输入，为提升他们教学效率，你给出的图片设计方案及原因",
	"prompts": [
	  "提示词1",
	  "提示词2",
      "提示词3",
	  "提示词n"
  ]
}`

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { teachingObject, subject, longTermGoal, topic, objective } = await req.json();

    const userContent = `
- 教学对象: ${teachingObject || '未指定'}
- 授课科目: ${subject || '未指定'}
- 长期教学目标: ${longTermGoal || '未指定'}
- 本次授课内容: ${topic || '未指定'}
- 本次教学目标: ${objective || '未指定'}
`
    const response = await openai.chat.completions.create({
        model: "gpt-4.1-2025-04-14",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
    });
    
    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content || '{}');

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating image prompts:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
