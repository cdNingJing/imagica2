export async function* callAIService(
  prompt: string,
  content?: string,
  stream: boolean = true,
  onMessage?: (message: any) => any
): any {
  const apiKey = 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK';
  const apiUrl = 'http://openai-proxy.brain.loocaa.com/v1/chat/completions';

  const contents = content ?? `You are a professional smart home steward, you need to guess what others are saying, and then give short and precise advice.
  - you must always reply in Chinese
  - Don't add any explanation, don't add any explanation, don't add any explanation.
  - I need you to think of several answers when you return the question and choose the one with the highest probability.
  - Your return needs to be logical and practical.
  - When I want to go somewhere, I want you to map it out.
  `
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: contents },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1000,
      stream: stream,
    }),
  });

  if(!stream) {
    const data = await response.json();
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      console.log("111 data", data, data.choices[0].message.content)
      if(onMessage) {
        onMessage(data.choices[0].message.content)
      }
      return data.choices[0].message.content;
    }
    return;
  }

  if (!response.ok) {
    throw new Error('API request failed');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Failed to get response reader');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const content = parseStreamChunk(chunk);
      if (content) {
        yield content;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function parseStreamChunk(chunk: string): string {
  const lines = chunk.split('\n').filter(line => line.trim() !== '');
  let content = '';
  for (const line of lines) {
    if (line.startsWith('data:')) {
      try {
        const data = JSON.parse(line.slice(5));
        if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
          content += data.choices[0].delta.content;
        }
      } catch (error) {
        // 忽略解析错误，继续处理下一行
      }
    }
  }
  return content;
}

export async function* callChatAIService(
  prompt: string,
  signal: AbortSignal,
  chatHistory: any[]
): AsyncGenerator<string, void, unknown> {
  const apiKey = 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK';
  const apiUrl = 'http://openai-proxy.brain.loocaa.com/v1/chat/completions';
  const systemPrompt = `您是一位精通行程规划的专家，能够敏锐把握客户需求。请遵循以下指南：

  1. 理解需求：无论是休闲、商务还是特殊兴趣旅行，准确理解客户意图。
  
  2. 个性化设计：设计独特且令人惊喜的行程，在信息不足时做出合理的默认选择。
  
  3. 全面考虑：考虑时间、预算、交通、住宿、餐饮、景点和季节等因素，打造高效舒适的旅程。
  
  4. 回答格式：您的回答应简洁明了，按以下格式提供：
  
     行程安排：[行程标题]
     第1天：
     - {"time": "08:00", "activity": "具体活动"}
     - {"time": "09:30", "activity": "具体活动"}
     第2天：
     - {"time": "08:00", "activity": "具体活动"}
     - {"time": "09:30", "activity": "具体活动"}
     ...
  
  5. 减少提问：尽量减少向客户提问，主动做出合理的默认选择。
  
  6. 关键词使用：在回答中务必包含"行程安排"或"旅行计划"这样的关键词。
  
  7. 额外建议：在行程安排后，可以简要提供一些专业建议，帮助客户更好地体验目的地魅力，避免不必要的麻烦。
  
  请确保您的回答始终遵循这个格式，以便系统能够正确识别和处理行程信息。`
  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory,
    { role: 'user', content: prompt },
  ];

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Failed to get response reader');
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const content = parseStreamChunk(chunk);
      if (content) {
        yield content;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

interface AIResponse {
  code: string;
  componentType: string;
  description: string;
}
