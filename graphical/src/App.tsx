import React from 'react';
import styled from 'styled-components';
import Canvas from './components/Canvas';
import ChatInterface from './components/ChatInterface';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const CanvasSection = styled.div`
  flex: 1;
  border-right: 1px solid #ccc;
`;

const ChatSection = styled.div`
  width: 300px;
`;

const App: React.FC = () => {
  return (
    <AppContainer>
      <CanvasSection>
        <Canvas />
      </CanvasSection>
      <ChatSection>
        <ChatInterface />
      </ChatSection>
    </AppContainer>
  );
};

export default App;