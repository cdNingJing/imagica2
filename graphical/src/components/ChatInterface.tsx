import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { sendMessageToGroq } from '../api/groqApi';
import ToastMessage from './ToastMessage';
import { useCanvas } from '../store/CanvasStore';
import { generateImage } from '../api/openaiApi';

// 添加新的样式组件
const CodeBlock = styled.pre`
  background-color: #282c34;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  line-height: 1.45;
  margin: 8px 0;
  color: #abb2bf;
  position: relative;
`;

const InlineCode = styled.code`
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
  font-size: 85%;
  margin: 0;
  padding: 0.2em 0.4em;
`;

const MessageContent = styled.div`
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ChatWindow = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 10px;
  background-color: #f0f0f0;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseIcon = styled.span`
  cursor: pointer;
  font-size: 20px;
`;

const ChatBody = styled.div`
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled.div<{ role: 'user' | 'assistant' }>`
  max-width: 90%;
  padding: 12px 16px;
  margin: 8px 0;
  background-color: ${props => props.role === 'user' ? '#f0f0f0' : 'transparent'};
  border-radius: 8px;
  align-self: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #e0e0e0;
`;

const SendButton = styled.button`
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:disabled {
    background-color: #cccccc;
  }
`;

const ChatInput = styled.input`
  flex-grow: 1;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

// 添加新的函数组件来渲染消息内容
interface MessageRendererProps {
  content: string;
  onCopySuccess: (code: string) => void;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content, onCopySuccess }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code.trim()).then(() => {
      setCopiedStates(prev => ({ ...prev, [index]: true }));
      setToastMessage('复制成功！');
      onCopySuccess(code.trim()); // 调用外部传入的回调函数
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [index]: false }));
      }, 3000);
    });
  };

  const handleToastClose = () => {
    setToastMessage(null);
  };

  const renderContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    // 处理代码块
    text.replace(codeBlockRegex, (match, lang, code, offset) => {
      elements.push(<span key={offset}>{text.slice(lastIndex, offset)}</span>);
      elements.push(
        <CodeBlockWrapper key={`code-${offset}`}>
          <CodeBlock>
            {code.trim()}
          </CodeBlock>
          <CopyButton 
            onClick={() => handleCopy(code, offset)}
            $copied={copiedStates[offset] || false}
          >
            {copiedStates[offset] ? '已复制' : '复制'}
          </CopyButton>
        </CodeBlockWrapper>
      );
      lastIndex = offset + match.length;
      return match;
    });

    // 处理剩余文本中的内联代码
    const remainingText = text.slice(lastIndex);
    let inlineLastIndex = 0;
    remainingText.replace(inlineCodeRegex, (match, code, offset) => {
      elements.push(<span key={`text-${offset}`}>{remainingText.slice(inlineLastIndex, offset)}</span>);
      elements.push(<InlineCode key={`inline-${offset}`}>{code}</InlineCode>);
      inlineLastIndex = offset + match.length;
      return match;
    });
    elements.push(<span key="final">{remainingText.slice(inlineLastIndex)}</span>);

    return elements;
  };

  return (
    <>
      <MessageContent>{renderContent(content)}</MessageContent>
      {toastMessage && (
        <ToastMessage 
          message={toastMessage} 
          onClose={handleToastClose}
        />
      )}
    </>
  );
};

// 修改 CopyButton 的类型定义
const CopyButton = styled.button<{ $copied: boolean }>`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: ${props => props.$copied ? '#28a745' : '#3a3a3a'};
  color: #d4d4d4;
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
  opacity: 0;
  transition: background-color 0.3s, opacity 0.2s;
  &:hover {
    background-color: #4a4a4a;
  }
`;

const CodeBlockWrapper = styled.div`
  position: relative;
  &:hover ${CopyButton} {
    opacity: 1;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  margin-left: 10px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`;

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, onMinimize, onMaximize }) => {
  const [inputMessage, setInputMessage] = useState('生成的图片');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const { addTestItem } = useCanvas(); // 移动到组件内部

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleGenerateImage = async () => {
    try {
      const description = `Generate a line chart with the following details:
- Description: The chart shows that the population has grown from about 2.5 billion in 1950 to about 8 billion in 2023 and is projected to reach about 9.7 billion by 2050. The growth curve has accelerated significantly in recent decades, especially in Asia and Africa.`;
      const imageUrls = await generateImage(description);
      console.log("生成的图片URL:", imageUrls);
      // 处理生成的图片URL，例如在UI中显示图片
    } catch (error) {
      console.error("生成图片失败:", error);
      // 处理错误，例如显示错误消息
    }
  };

  const handleSendMessage = useCallback(async () => {
    handleGenerateImage()
    return;
    if (!inputMessage.trim()) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      const response = await sendMessageToGroq({
        message: inputMessage,
        onChunk: (chunk: any) => setStreamingMessage(prev => prev + chunk)
      });
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.text // 使用 response.text 而不是整个 response 对象
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setStreamingMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
      // 处理错误，可能显示一个错误消息给用户
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximize();
  };

  const handleCopySuccess = useCallback((code: string) => {
    addTestItem(code);
  }, [addTestItem]); // 添加 addTestItem 到依赖数组

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    
    // 确保输入框获得焦点
    (e.target as HTMLInputElement).focus();
  };

  const handleInputMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation(); // 阻止事件冒泡
  };

  return (
    <ChatWindow>
      <ChatHeader className="handle">
        <span>AI 对话</span>
        <HeaderActions>
          <IconButton onClick={onMinimize} title="最小化">
            &#8211;
          </IconButton>
          <IconButton onClick={handleMaximize} title={isMaximized ? "还原" : "最大化"}>
            {isMaximized ? '❐' : '☐'}
          </IconButton>
          <IconButton onClick={onClose} title="关闭">
            &#x2715;
          </IconButton>
        </HeaderActions>
      </ChatHeader>
      <ChatBody ref={chatBodyRef}>
        {messages.map((message, index) => (
          <MessageBubble key={index} role={message.role}>
            <MessageRenderer 
              content={message.content} 
              onCopySuccess={handleCopySuccess}
            />
          </MessageBubble>
        ))}
        {streamingMessage && (
          <MessageBubble role="assistant">
            <MessageRenderer 
              content={streamingMessage} 
              onCopySuccess={handleCopySuccess}
            />
          </MessageBubble>
        )}
      </ChatBody>
      <ChatInputContainer>
        <ChatInput 
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onClick={handleInputClick}
          onMouseDown={handleInputMouseDown}
          placeholder="输入消息..."
          disabled={isLoading}
        />
        <SendButton onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
          发送
        </SendButton>
      </ChatInputContainer>
    </ChatWindow>
  );
};

export default ChatInterface;