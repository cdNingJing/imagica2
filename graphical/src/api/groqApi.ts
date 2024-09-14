import axios from 'axios';
import { processDataForImageGeneration, FormattedData } from '../utils/dataFormatter';

const GROQ_API_KEY = "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";
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ContextInfo {
  time?: string;
  date?: string;
  location?: string;
  [key: string]: string | undefined;
}

const createEnhancedMessage = (userMessage: string, contextInfo: ContextInfo): string => {
  let contextString = Object.entries(contextInfo)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return `用户问题: "${userMessage}"
上下文信息: ${contextString}
请根据用户问题和提供的上下文信息,以简洁的方式回答。只返回用户所需的信息,不要添加额外解释。`;
};

export const sendMessageToGroq = async ({
  message,
  onChunk
}: {
  message: string;
  onChunk: (chunk: string) => void;
}): Promise<{ text: string, structuredData: FormattedData[] }> => {
  try {
    // 获取当前上下文信息
    const contextInfo: ContextInfo = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(),
      // 可以添加更多上下文信息
    };

    const enhancedMessage = createEnhancedMessage(message, contextInfo);

    const response = await axios.post(
      API_URL,
      {
        messages: [
          {
            role: 'system',
            content: '你是一个简洁的助手,只回答用户询问的信息,不要添加额外的解释。',
          },
          {
            role: 'user',
            content: enhancedMessage,
          },
        ],
        model: 'llama3-8b-8192',
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseContent = response.data.choices[0].message.content.trim();
    
    // 假设响应内容是以逗号分隔的数据项
    const dataItems = responseContent.split(',').map((item: string) => item.trim());
    
    // 使用 processDataForImageGeneration 函数处理数据
    const structuredData = processDataForImageGeneration(dataItems);

    console.log('111 处理后的数据:', responseContent, structuredData);
    return {
      text: responseContent,
      structuredData: structuredData
    };
  } catch (error) {
    console.error('调用 Groq API 时出错:', error);
    throw error;
  }
};