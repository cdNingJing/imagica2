import axios from 'axios';

const OPENAI_PROXY_URL = 'http://openai-proxy.brain.loocaa.com/v1/images/generations';
const API_KEY = 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK';

interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url: string;
  }>;
}

export const generateImageWithDALLE = async (prompt: string, n: number = 1, size: string = "300x300"): Promise<string[]> => {
  try {
    const response = await axios.post<ImageGenerationResponse>(
      OPENAI_PROXY_URL,
      {
        prompt: prompt,
        n: n,
        size: size
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    if (response.data && response.data.data && response.data.data.length > 0) {
      const imageUrls = response.data.data.map(item => item.url);
      return imageUrls;
    } else {
      throw new Error('响应中没有有效的图片URL');
    }
  } catch (error) {
    console.error('调用 OpenAI API 生成图片时出错:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios错误详情:', error.response?.data);
    }
    throw error;
  }
};

// 示例使用方法
export const generateImage = async (description: string): Promise<string[]> => {
  try {
    const imageUrls = await generateImageWithDALLE(description);
    console.log("生成的图片URL:", imageUrls);
    return imageUrls;
  } catch (error) {
    console.error('生成图片时出错:', error);
    throw error;
  }
};