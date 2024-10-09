import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input, Button, List, Typography, Space, message } from 'antd'
import { SendOutlined, LoadingOutlined, CopyOutlined } from '@ant-design/icons'
import { callChatAIService } from './../api/aiService'
import { useShapeStore } from '../store/ShapeStore'
import styles from './ChatWindow.module.scss'
import WaveLoader from './WaveLoader';
import { debounce } from 'lodash';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';

const { TextArea } = Input;
const { Text } = Typography;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [currentItinerary, setCurrentItinerary] = useState<{ title: string; schedule: any[] } | null>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom()
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    }
  }, [messages, scrollToBottom])

  const { addRandomShape } = useShapeStore();

  const renderSchedule = useCallback((scheduleData: any[]) => (
    <div className="modern-timeline">
      {scheduleData.map((day, dayIndex) => (
        <div key={dayIndex} className="modern-day">
          <h3 className="modern-day-title">{day.day}</h3>
          <div className="modern-schedule-list">
            {day.schedule.map((item: any, itemIndex: number) => (
              <div key={itemIndex} className="modern-schedule-item">
                <div className="modern-time">{item.time}</div>
                <div className="modern-activity">{item.activity}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ), []);

  function formatItinerary(title: string, schedule: any[]): string {
    let formattedItinerary = `行程安排：${title}\n\n`;
    schedule.forEach(day => {
      formattedItinerary += `${day.day}\n`;
      day.schedule.forEach((item: any) => {
        formattedItinerary += `  ${item.time} ${item.activity}\n`;
      });
      formattedItinerary += '\n';
    });
    return formattedItinerary;
  }

  const handleSubmit = useCallback(async () => {
    if (input.trim() === '') return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = { role: 'user', content: input };
    const aiMessage: Message = { role: 'assistant', content: '' };

    setMessages(prevMessages => [...prevMessages, userMessage, aiMessage]);
    setInput('');
    console.log('生成 AI 开始', true);
    setIsLoading(true);
    setCurrentItinerary(null);

    let aiResponse = '';
    let extractedItinerary: any = null;

    try {
      const aiStream = callChatAIService(
        input, 
        abortControllerRef.current.signal, 
        messages
      );

      for await (const chunk of aiStream) {
        if (chunk === 'data: [DONE]') {
          break;
        }
        aiResponse += chunk;
        await new Promise<void>(resolve => {
          requestAnimationFrame(() => {
            setMessages(prevMessages => {
              const newMessages = [...prevMessages];
              newMessages[newMessages.length - 1] = { ...aiMessage, content: aiResponse };
              return newMessages;
            });

            // 检查并更新行程
            if (containsItinerary(aiResponse)) {
              extractedItinerary = extractItineraryInfo(aiResponse);
              setCurrentItinerary(extractedItinerary);
            }

            resolve();
          });
        });
      }

      // 移到这里，确保在流处理完成后执行
      if (extractedItinerary) {
        addRandomShape({
          title: extractedItinerary.title,
          schedule: extractedItinerary.schedule,
          centerText: formatItinerary(extractedItinerary.title, extractedItinerary.schedule),
          isVisible: true,
        });
        message.success('已创建新的行程规划图形');
      }
    } catch (error: any) {
      console.error('生成 AI 响应时出错:', error);
      message.error('生成响应时发生错误，请重试');
    } finally {
      console.log('生成 AI 结束', false);
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, messages, addRandomShape]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    message.success('代码已复制到剪贴板');
  }

  const parseAIResponse = (response: string): Array<{ type: 'text' | 'code'; value: string; language?: string }> => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const cssBlockRegex = /css\.[\s\S]*?}/g;
    const parsedContent: Array<{ type: 'text' | 'code'; value: string; language?: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const addUniqueContent = (content: { type: 'text' | 'code'; value: string; language?: string }) => {
      if (parsedContent.length === 0 || content.value !== parsedContent[parsedContent.length - 1].value) {
        parsedContent.push(content);
      }
    };

    while ((match = codeBlockRegex.exec(response)) !== null) {
      if (match.index > lastIndex) {
        const textContent = response.slice(lastIndex, match.index);
        const cssMatch = textContent.match(cssBlockRegex);
        if (cssMatch && cssMatch.index !== undefined) {
          addUniqueContent({ type: 'text', value: textContent.slice(0, cssMatch.index) });
          addUniqueContent({ type: 'code', value: cssMatch[0], language: 'css' });
          addUniqueContent({ type: 'text', value: textContent.slice(cssMatch.index + cssMatch[0].length) });
        } else {
          addUniqueContent({ type: 'text', value: textContent });
        }
      }
      const language = match[1] || 'javascript';
      const codeContent = match[2].trim();
      if (codeContent) {
        addUniqueContent({ type: 'code', value: codeContent, language });
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < response.length) {
      const remainingContent = response.slice(lastIndex);
      const cssMatch = remainingContent.match(cssBlockRegex);
      if (cssMatch && cssMatch.index !== undefined) {
        addUniqueContent({ type: 'text', value: remainingContent.slice(0, cssMatch.index) });
        addUniqueContent({ type: 'code', value: cssMatch[0], language: 'css' });
        addUniqueContent({ type: 'text', value: remainingContent.slice(cssMatch.index + cssMatch[0].length) });
      } else {
        addUniqueContent({ type: 'text', value: remainingContent });
      }
    }

    return parsedContent;
  };

  const renderGeneratedComponent = useCallback((content: string) => {
    const parsedContent = parseAIResponse(content);
    let extraSuggestion = null;

    return (
      <div className={styles.generatedContent}>
        {parsedContent.map((item, index) => {
          if (item.type === 'text') {
            if (item.value.startsWith('行程安排：')) {
              const extraSuggestions = item.value.split('额外建议：');
              if (extraSuggestions.length > 1) {
                extraSuggestion = (
                  <div className={styles.itineraryBlock}>
                    <Text strong>额外建议：</Text>
                    <Text>{extraSuggestions[1].trim()}</Text>
                  </div>
                );
              }
              return null; // 不显示行程安排的主要内容
            }
            return null;
            // return <Text key={index}>{item.value}</Text>;
          } else {
            return (
              <div key={index} className={styles.codeBlock}>
                <pre>
                  <code className={`language-${item.language || 'javascript'}`}>
                    {item.value}
                  </code>
                </pre>
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => handleCopy(item.value)} 
                  className={styles.copyButton}
                  size="small"
                >
                  复制
                </Button>
              </div>
            );
          }
        })}
        {currentItinerary && (
          <div className={styles.itineraryPreview}>
            {renderSchedule(currentItinerary.schedule)}
          </div>
        )}
        {extraSuggestion} {/* 将额外建议放在最后 */}
      </div>
    );
  }, [currentItinerary, renderSchedule, handleCopy]);

  const renderMessage = useCallback((msg: Message) => {
    return (
      <div className={`${styles.message} ${styles[msg.role]}`}>
        <div className={styles.messageContent}>
          {msg.role === 'user' ? (
            <Text className={styles.userText}>{msg.content}</Text>
          ) : (
            renderGeneratedComponent(msg.content)
          )}
        </div>
      </div>
    );
  }, [renderGeneratedComponent]);

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatMessages} ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <React.Fragment key={index}>
            {renderMessage(msg)}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {isLoading && <WaveLoader className="custom-wave-loader" />}

      <div className={styles.inputForm}>
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的需求..."
          disabled={isLoading}
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
        <Space>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            disabled={isLoading} 
            icon={isLoading ? <LoadingOutlined /> : <SendOutlined />}
          >
            发送
          </Button>
          {isLoading && (
            <Button onClick={handleCancel}>
              取消
            </Button>
          )}
        </Space>
      </div>
    </div>
  )
}

// 辅助函数：检查 AI 响应是否包含行程规划
function containsItinerary(response: string): boolean {
  // 这里可以使用正则表达式或关键词匹配来检测行程规划
  // 例如：检查是否包含 "行程安排" 或 "旅行计划" 等关键词
  return /行程安排|旅行计划|itinerary|schedule/i.test(response);
}

// 辅助函数：从 AI 响应中提取行程信息
function extractItineraryInfo(response: string): { title: string; schedule: any[] } {
  const lines = response.split('\n');
  const title = lines.find(line => line.includes('行程安排') || line.includes('旅行计划'))?.split('：')[1]?.trim() || '未命名行程';
  const schedule = [];
  let currentDay: any = null;

  for (const line of lines) {
    if (line.startsWith('第') && line.includes('天')) {
      if (currentDay) {
        schedule.push(currentDay);
      }
      currentDay = {
        day: line.trim(),
        schedule: []
      };
    } else if (currentDay && line.trim()) {
      try {
        // 尝试解析 JSON 格式的行程数据
        const jsonMatch = line.trim().match(/^-?\s*(\{.+\})$/);
        if (jsonMatch) {
          const scheduleItem = JSON.parse(jsonMatch[1]);
          if (scheduleItem.time && scheduleItem.activity) {
            currentDay.schedule.push(scheduleItem);
          }
        } else {
          // 如果不是 JSON 格式，尝试使用之前的正则表达式
          const match = line.trim().match(/^-?\s*(\d{2}:\d{2})\s+(.+)$/);
          if (match) {
            currentDay.schedule.push({
              time: match[1],
              activity: match[2]
            });
          }
        }
      } catch (error) {
        console.error('Error parsing schedule item:', error);
      }
    }
  }

  if (currentDay && currentDay.schedule.length > 0) {
    schedule.push(currentDay);
  }

  return { title, schedule };
}

export default ChatWindow;