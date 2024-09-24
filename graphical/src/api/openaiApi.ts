import axios from 'axios';

const OPENAI_PROXY_URL = 'http://openai-proxy.brain.loocaa.com/v1/images/generations';
const API_KEY = 'DlJYSkMVj1x4zoe8jZnjvxfHG6z5yGxK';

interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url: string;
  }>;
}
 //size 的默认值 '256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'
export const generateImageWithDALLE = (description: string, n: number = 1, size: string = "1024x1024"): any => {
  console.log("开始生成图片");

  // 固定的提示词部分
  const fixedPrompt = `As a skilled chart maker, craft a clear, accurate chart.
- Data: Ensure precise plotting, no missing/misplaced values.
- Labels: Clear, descriptive for axes & legend.
- Type: Choose chart type best for data (bar, line, pie).
Create a chart that inspires confidence & clarity.
  `;

  // 动态部分
  const prompt = `${fixedPrompt}\n- Additional Description: ${description}`;

  try {
    console.log("图片生成提示:", prompt);
    
    return axios.post<ImageGenerationResponse>(
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
    ).then((response) => {

      console.log("收到响应", response);
      console.log("响应状态:", response.status);
      console.log("响应头:", response.headers);
      console.log("响应数据:", JSON.stringify(response.data, null, 2));

      if (response.data && response.data.data && response.data.data.length > 0) {
        const imageUrls = response.data.data.map(item => item.url);
        console.log("生成的图片URL:", imageUrls);
        return imageUrls;
      } else {
        console.log("响应中没有有效的图片URL");
        throw new Error('响应中没有有效的图片URL');
      }
    }).catch((error) => {
      console.error('调用 OpenAI API 生成图片时出错:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios错误详情:', error.response?.data);

        throw error;
      }
    });

    // console.log("收到响应");
    // console.log("响应状态:", response.status);
    // console.log("响应头:", response.headers);
    // console.log("响应数据:", JSON.stringify(response.data, null, 2));

    // if (response.data && response.data.data && response.data.data.length > 0) {
    //   const imageUrls = response.data.data.map(item => item.url);
    //   console.log("生成的图片URL:", imageUrls);
    //   return imageUrls;
    // } else {
    //   console.log("响应中没有有效的图片URL");
    //   throw new Error('响应中没有有效的图片URL');
    // }
  } catch (error) {
    console.error('调用 OpenAI API 生成图片时出错:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios错误详情:', error.response?.data);
    }
    throw error;
  }
};

// 示例使用方法
export const generateImage = async (additionalDescription: string): Promise<string[]> => {
  try {
    const imageUrls = await generateImageWithDALLE(additionalDescription);
    console.log("生成的图片URL:", imageUrls);
    return imageUrls;
  } catch (error) {
    console.error('生成图片时出错:', error);
    throw error;
  }
};