import axios from 'axios';

const GROQ_API_KEY = "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";
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const sendMessageToGroq = async ({
  message,
  onChunk
}: {
  message: string;
  onChunk: (chunk: string) => void;
}): Promise<string> => {
  try {
    const response = await axios.post(
      API_URL,
      {
        messages: [
          {
            role: 'user',
            content: message,
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
};