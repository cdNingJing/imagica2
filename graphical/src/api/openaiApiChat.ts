const OPENAI_PROXY_URL = 'http://openai-proxy.brain.loocaa.com/v1/chat/completions';
const API_KEY = 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const generateChatResponse = async (messages: any, content?: string): Promise<string> => {
  console.log("开始生成聊天回复，时间:", new Date().toISOString());
  const contents = content ?? `You are a professional smart home steward, you need to guess what others are saying, and then give short and precise advice.
  - you must always reply in Chinese
  - Don't add any explanation, don't add any explanation, don't add any explanation.
  - I need you to think of several answers when you return the question and choose the one with the highest probability.
  - Your return needs to be logical and practical.
  - When I want to go somewhere, I want you to map it out.
  `
  try {
    console.log("发送请求到:", OPENAI_PROXY_URL);
    const response = await fetch(OPENAI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: 'system',
            content: contents,
          },
          {
            role: 'user',
            content: messages,
          },
        ],
        temperature: 0.7,
      })
    });

    console.log("收到响应，时间:", new Date().toISOString());
    console.log("响应状态:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatCompletionResponse = await response.json();
    console.log("解析后的响应数据:", JSON.stringify(data, null, 2));

    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      const reply = data.choices[0].message.content;
      console.log("生成的回复:", reply);
      return reply;
    } else {
      console.log("响应中没有找到有效的回复");
      throw new Error('响应中没有有效的回复');
    }
  } catch (error) {
    console.error('调用 OpenAI API 生成聊天回复时出错:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
    throw error;
  }
};