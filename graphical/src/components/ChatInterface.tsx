import React, { useState } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatHistory = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const InputArea = styled.div`
  padding: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 5px;
`;

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput('');
      // 这里可以添加发送消息到AI的逻辑
    }
  };

  return (
    <ChatContainer>
      <ChatHistory>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </ChatHistory>
      <InputArea>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="输入消息..."
        />
      </InputArea>
    </ChatContainer>
  );
};

export default ChatInterface;