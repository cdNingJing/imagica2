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

const createEnhancedMessage = (userMessage: string): string => {
  return `用户问题: "${userMessage}", 以简洁的方式回答。`;
};

const getValidNumber = (value: any, defaultValue: number): number => {
  console.log('value', value, defaultValue);
  if (value == undefined || value == null) {
    return defaultValue;
  }
  const num = Number(value);
  return !isNaN(num) ? num : defaultValue;
};

let previousQuestion = '';
let previousAnswer = '';

export const sendMessageToGroq = async ({
  message,
  onChunk
}: {
  message: string;
  onChunk: (chunk: string) => void;
}): Promise<{ text: string, structuredData: FormattedData[] }> => {
  try {
    const enhancedMessage = createEnhancedMessage(message);
    
    // - !!!I hope you can return Chinese when the user enters Chinese!!!
    // - !!!and English when the user enters English!!!

    const response = await axios.post(
      API_URL,
      {
        messages: [
          {
            role: 'system',
            content: `You are a professional smart home steward, you need to guess what others are saying, and then give short and precise advice.
              - you must always reply in Chinese
              - Don't add any explanation, don't add any explanation, don't add any explanation.
              - I need you to think of several answers when you return the question and choose the one with the highest probability.
              - Your return needs to be logical and practical.
              - When I want to go somewhere, I want you to map it out.
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

    const responseContent = response.data.choices[0].message.content;

    // 保存当前问题和答案
    previousQuestion = message;
    previousAnswer = responseContent;

    return {
      text: responseContent,
      structuredData: responseContent
    };
  } catch (error) {
    console.error('调用 Groq API 时出错:', error);
    throw error;
  }
};

// 获取上一次的问题和答案
export const getPreviousQA = () => ({
  question: previousQuestion,
  answer: previousAnswer
});

export const fusionShapes = async ({
  message,
  onChunk
}: {
  message: string;
  onChunk: (chunk: string) => void;
}): Promise<{ text: string, structuredData: FormattedData[] }> => {
  try {
    const enhancedMessage = `请将以下图形组合成一个新的、有创意的图形：${message}。`;

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
            5) 请将这些数据合并成一个可以显示的图形!!!。
            6) !!!返回格式 '{"answer": "", "params": {}}!!!'
            7) 我会传给你多条数据的文本，请将这些数据合并成一个图形。
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