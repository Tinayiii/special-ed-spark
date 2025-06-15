
import { Message } from '@/types/chat';

// (1) 在这里填入您的LLM API Key
// 注意：直接在前端代码中暴露API Key存在安全风险。
// 在生产环境中，建议将此逻辑移至后端服务，并通过API调用来访问。
const apiKey = 'YOUR_LLM_API_KEY_HERE';

export async function getLLMResponse(messages: Message[]): Promise<string> {
  // 这是调用LLM API的预留位置。
  // 您需要用实际的API请求替换下面的模拟逻辑。
  // 用户提到Python语法，这里是TypeScript中使用fetch API的等效实现。
  //
  // Python 示例:
  //
  // import openai
  // openai.api_key = "YOUR_LLM_API_KEY_HERE"
  // response = openai.ChatCompletion.create(
  //   model="gpt-4",
  //   messages=[{"role": m.role, "content": m.content} for m in messages]
  // )
  // return response.choices[0].message.content

  console.log("调用LLM API，传入以下消息:", messages);
  console.log("使用的API Key:", apiKey.startsWith('YOUR_') ? "请替换为您的API Key" : "已配置");

  if (!apiKey || apiKey === 'YOUR_LLM_API_KEY_HERE') {
    return Promise.resolve("请在 `src/services/aiService.ts` 文件中配置您的LLM API Key，然后我才能真正开始工作。");
  }

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 模拟API调用 (您需要替换这部分)
  try {
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', { // 以OpenAI为例
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4', // 替换为您想用的模型
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
    */
    
    // 目前返回一个模拟的成功消息
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    return `任务处理完成。根据您的要求（“${lastUserMessage}”），我已经生成了内容。由于这只是一个模拟，实际内容需要您接入真实LLM后才能看到。`;

  } catch (error) {
    console.error('Error calling LLM API:', error);
    return '调用大模型API时出错，请检查控制台获取更多信息。';
  }
}
