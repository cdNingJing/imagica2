const OPENAI_PROXY_URL = 'http://openai-proxy.brain.loocaa.com/v1/images/generations';
const API_KEY = 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK';

interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url: string;
  }>;
}

export const generateImageWithDALLE = async (prompt: string, n: number = 1, size: string = "1024x1024"): Promise<string[]> => {
  console.log("开始生成图片，时间:", new Date().toISOString());

  try {
    console.log("发送请求到:", OPENAI_PROXY_URL);
    const response = await fetch(OPENAI_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Cache-Control': 'no-cache', // 禁用缓存
      },
      body: JSON.stringify({
        prompt: prompt,
        n: n,
        size: size
      })
    });

    console.log("收到响应，时间:", new Date().toISOString());
    console.log("响应状态:", response.status);
    console.log("响应类型:", response.type);
    console.log("响应URL:", response.url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("开始解析JSON，时间:", new Date().toISOString());
    const data = await response.json();
    console.log("JSON解析完成，时间:", new Date().toISOString());
    console.log("解析后的响应数据:", JSON.stringify(data, null, 2));

    console.log("data 类型:", typeof data);
    console.log("data 的键:", Object.keys(data));

    if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
      const imageUrls = data.data.map((item: any) => item.url);
      console.log("生成的图片URL:", imageUrls);
      return imageUrls;
    } else {
      console.log("响应中没有找到有效的图片URL");
      console.log("完整的响应数据:", data);
      throw new Error('响应中没有有效的图片URL');
    }
  } catch (error) {
    console.error('调用 OpenAI API 生成图片时出错:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    throw error;
  }
};

// 示例使用方法
export const generateImage = async (additionalDescription: string): Promise<string[]> => {
  try {
    console.log("开始生成图片，附加描述:", additionalDescription);
    const imageUrls = await generateImageWithDALLE(additionalDescription);
    console.log("生成的图片URL:", imageUrls);
    return imageUrls;
  } catch (error) {
    console.error('生成图片时出错:', error);
    throw error;
  }
};