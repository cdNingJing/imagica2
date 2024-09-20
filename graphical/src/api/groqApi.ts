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

export const sendMessageToGroq = async ({
  message,
  onChunk
}: {
  message: string;
  onChunk: (chunk: string) => void;
}): Promise<{ text: string, structuredData: FormattedData[] }> => {
  try {
    const enhancedMessage = createEnhancedMessage(message);

    const response = await axios.post(
      API_URL,
      {
        messages: [
          {
            role: 'system',
            content: `你是一个专业的智能对话系统的工作流程，该系统能够理解用户意图，收集必要信息，并提供相应的建议或解决方案。
            这个过程：
            理解用户意图
            分析用户输入的问题或陈述
            识别核心需求和潜在目标
            收集上下文信息
            检查已有的用户信息（如位置、偏好等）
            如果缺少关键信息，主动询问用户
            分析和推理
            基于收集到的信息进行分析
            考虑可能的选项和建议
            提供建议或解决方案
            根据分析结果给出针对性的建议
            确保建议符合用户的具体情况和需求
            确认和反馈
            询问用户是否满意建议
            如需要，进一步调整或提供更多选项
            示例流程：
            用户：这个周末去哪里好？
            系统：
            理解意图：用户在寻找周末出行建议。
            收集信息：
            "为了给您提供最合适的建议，我需要知道您当前所在的位置。方便告诉我您现在在哪个城市吗？"
            用户：我在北京。
            系统：
            分析：考虑北京及周边的周末去处。
            提供建议：
            "考虑到您在北京，这个周末有几个不错的选择：
            1. 游览长城（如慕田峪长城）
            2. 参观798艺术区
            逛逛什刹海和南锣鼓巷
            去颐和园放松一天
            这些地方各有特色，适合周末游玩。您对哪个更感兴趣？"
            5. 确认： "如果您需要更多建议或者对某个地方有具体问题，随时告诉我。"
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
    // const structuredData = [processDataForImageGeneration(responseContent)];

    console.log('111 structuredData', responseContent);
    // 处理 structuredData
    // const { shapes, addShape } = useShapeStore.getState();
    // const maxId = shapes.reduce((max, shape) => Math.max(max, parseInt(shape.id)), 0);
    
    // structuredData.forEach((data, index) => {
    //   if (data && typeof data === 'object') {
    //     const metadata = data?.metadata || {};
    //     const x = getValidNumber(metadata?.x, Math.random() * 500);
    //     const y = getValidNumber(metadata?.y, Math.random() * 500);
    //     console.log('Calculated x, y:', x, y);

    //     const newShape = {
    //       id: (maxId + index + 1).toString(),
    //       text: data.value || '',
    //       shapeType: data.type as 'circle' | 'rectangle' | 'triangle' | 'ellipse' | 'pentagon' | 'hexagon' | 'star' | 'diamond',
    //       layer: 0,
    //       x,
    //       y,
    //       zIndex: shapes.length + index,
    //       size: getValidNumber(metadata?.size, 50),
    //       color: metadata.color || '#000000',
    //       fontFamily: metadata?.fontFamily || 'Arial',
    //       fontSize: getValidNumber(metadata?.fontSize, 14),
    //       fontColor: metadata?.fontColor || '#000000',
    //     };

    //     console.log('New shape before spreading metadata:', newShape);

    //     const finalShape: any = { ...newShape };
    //     if (metadata) {
    //       Object.keys(metadata).forEach(key => {
    //         if (!finalShape.hasOwnProperty(key)) {
    //           finalShape[key] = metadata[key];
    //         }
    //       });
    //     }

    //     console.log('Final shape after manual merging:', finalShape);
    //     addShape(finalShape);
    //   } else {
    //     console.warn('Invalid data structure received:', data);
    //   }
    // });

    return {
      text: responseContent,
      structuredData: responseContent
    };
  } catch (error) {
    console.error('调用 Groq API 时出错:', error);
    throw error;
  }
};

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