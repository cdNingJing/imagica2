import React, { useRef, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Resizable, ResizeCallback, ResizableProps } from 're-resizable';
import Canvas from './components/Canvas';
import ChatInterface from './components/ChatInterface';
import FloatingIcon from './components/FloatingIcon';

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const ChatContainer = styled.div<{ position: { x: number; y: number } }>`
  position: absolute;
  top: ${props => props.position.y}px;
  left: ${props => props.position.x}px;
`;

const App: React.FC = () => {
  const [size, setSize] = useState({ width: 300, height: 400 });
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 20 });
  const [isOpen, setIsOpen] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleResize: ResizeCallback = (e, direction, ref, delta) => {
    const newSize = {
      width: size.width + delta.width,
      height: size.height + delta.height
    };

    setSize(newSize);

    // 如果调整大小的方向包含 'left'，则需要调整位置
    if (direction.includes('left')) {
      setPosition(prevPos => ({
        ...prevPos,
        x: prevPos.x - delta.width
      }));
    }

    // 如果调整大小的方向包含 'top'，则需要调整位置
    if (direction.includes('top')) {
      setPosition(prevPos => ({
        ...prevPos,
        y: prevPos.y - delta.height
      }));
    }
  };

  const onMouseDown = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('handle')) {
      isDraggingRef.current = true;
      startPosRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  }, [position]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current || !chatRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const chatRect = chatRef.current.getBoundingClientRect();

    let newX = e.clientX - startPosRef.current.x;
    let newY = e.clientY - startPosRef.current.y;

    // 添加边界限制
    newX = Math.max(0, Math.min(newX, containerRect.width - chatRect.width));
    newY = Math.max(0, Math.min(newY, containerRect.height - chatRect.height));

    setPosition({ x: newX, y: newY });
  }, []);

  const onMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    const chatElement = chatRef.current;
    if (!chatElement) return;

    chatElement.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      chatElement.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseDown, onMouseMove, onMouseUp]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const resizableProps: ResizableProps = {
    size: size,
    onResizeStop: handleResize,
    minWidth: 200,
    minHeight: 200,
    maxWidth: "calc(100vw - 40px)",
    maxHeight: "calc(100vh - 40px)",
    bounds: "window",
    enable: {
      top: false,
      right: true,
      bottom: true,
      left: false,
      topRight: false,
      bottomRight: true,
      bottomLeft: false,
      topLeft: false
    }
  };

  return (
    <AppContainer ref={containerRef}>
      <CanvasContainer>
        <Canvas />
      </CanvasContainer>
      {isOpen ? (
        <ChatContainer ref={chatRef} position={position}>
          <Resizable {...resizableProps}>
            <ChatInterface onClose={toggleChat} />
          </Resizable>
        </ChatContainer>
      ) : (
        <FloatingIcon onClick={toggleChat} />
      )}
    </AppContainer>
  );
};

export default App;