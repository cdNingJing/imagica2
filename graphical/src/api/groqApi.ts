import axios from 'axios';
import { processDataForImageGeneration, FormattedData } from '../utils/dataFormatter';
import { useShapeStore } from '../store/ShapeStore';

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
请根据用户问题和提供的上下文信息,以简洁的方式回答。`;
};

const getValidNumber = (value: any, defaultValue: number): number => {
  console.log('value', value, defaultValue);
  if (value == undefined || value == null) {
    return defaultValue;
  }
  const num = Number(value);
  return !isNaN(num) ? num : defaultValue;
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
            content: `你是一个专门用于文本到图形转换的AI助手。你的任务是: 
            1) 回答用户的问题,请基于用户问题和上下文信息回答,保持简洁,不要添加不必要的解释。
            2) 将用户的文本描述转换为D3.js可用的图形参数。
            3) 回答格式为：首先简洁地回答用户问题，然后用一个JSON对象列出图形参数。支持的图形类型包括：circle、rectangle、triangle、ellipse、pentagon、hexagon、star 和 diamond。必要的参数包括 shapeType（形状类型）、size（大小）、color（颜色），根据描述可能还需要其他相关参数。
            4) 回答中不要包含任何其他文本，只返回JSON对象。
            5) 回答中需要返回问题的答案和图形参数!!!。
            6) !!!返回格式 '{"answer": "", "params": {}}!!!'
            `
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

    const responseContent = response.data.choices[0].message.content
    
    // 使用 processDataForImageGeneration 函数处理数据
    const structuredData = [processDataForImageGeneration(responseContent)];

    console.log('111 structuredData', structuredData);
    // 处理 structuredData
    const { shapes, addShape } = useShapeStore.getState();
    const maxId = shapes.reduce((max, shape) => Math.max(max, parseInt(shape.id)), 0);
    
    structuredData.forEach((data, index) => {
      if (data && typeof data === 'object') {
        const metadata = data?.metadata || {};
        const x = getValidNumber(metadata?.x, Math.random() * 500);
        const y = getValidNumber(metadata?.y, Math.random() * 500);
        console.log('Calculated x, y:', x, y);

        const newShape = {
          id: (maxId + index + 1).toString(),
          text: data.value || '',
          shapeType: data.type as 'circle' | 'rectangle' | 'triangle' | 'ellipse' | 'pentagon' | 'hexagon' | 'star' | 'diamond',
          layer: 0,
          x,
          y,
          zIndex: shapes.length + index,
          size: getValidNumber(metadata?.size, 50),
          color: metadata.color || '#000000',
          fontFamily: metadata?.fontFamily || 'Arial',
          fontSize: getValidNumber(metadata?.fontSize, 14),
          fontColor: metadata?.fontColor || '#000000',
        };

        console.log('New shape before spreading metadata:', newShape);

        const finalShape: any = { ...newShape };
        if (metadata) {
          Object.keys(metadata).forEach(key => {
            if (!finalShape.hasOwnProperty(key)) {
              finalShape[key] = metadata[key];
            }
          });
        }

        console.log('Final shape after manual merging:', finalShape);
        addShape(finalShape);
      } else {
        console.warn('Invalid data structure received:', data);
      }
    });

    return {
      text: 'Ok',
      structuredData: structuredData
    };
  } catch (error) {
    console.error('调用 Groq API 时出错:', error);
    throw error;
  }
};