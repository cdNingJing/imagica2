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
  console.log("111 contents", )
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

interface AIResponse {
  code: string;
  componentType: string;
  description: string;
}
