import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { sendMessageToGroq } from '../api/groqApi';

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
  max-width: 70%;
  padding: 10px;
  margin: 5px;
  border-radius: 10px;
  background-color: ${props => props.role === 'user' ? '#007bff' : '#f0f0f0'};
  color: ${props => props.role === 'user' ? 'white' : 'black'};
  align-self: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
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
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      const response = await sendMessageToGroq({
        message: inputMessage,
        onChunk: (chunk) => setStreamingMessage(prev => prev + chunk)
      });
      const assistantMessage: Message = { role: 'assistant', content: response };
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

  return (
    <ChatWindow>
      <ChatHeader className="handle">
        <span>AI 对话</span>
        <CloseIcon onClick={onClose}>×</CloseIcon>
      </ChatHeader>
      <ChatBody ref={chatBodyRef}>
        {messages.map((message, index) => (
          <MessageBubble key={index} role={message.role}>
            {message.content}
          </MessageBubble>
        ))}
        {streamingMessage && (
          <MessageBubble role="assistant">
            {streamingMessage}
          </MessageBubble>
        )}
      </ChatBody>
      <ChatInputContainer>
        <ChatInput 
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
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