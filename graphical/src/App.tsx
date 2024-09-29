import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Resizable, ResizeCallback, ResizableProps } from 're-resizable';
import Canvas from './components/Canvas';
import ChatInterface from './components/ChatInterface';
import FloatingIcon from './components/FloatingIcon';
import { CanvasProvider } from './store/CanvasStore';
import ChatWindow from './components/ChatWindow';
import styles from './App.module.scss'

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

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [size, setSize] = useState<Size>(() => {
    const savedSize = localStorage.getItem('appSize');
    return savedSize ? JSON.parse(savedSize) : { width: 400, height: 300 };
  });

  const [position, setPosition] = useState<Position>(() => {
    const savedPosition = localStorage.getItem('appPosition');
    return savedPosition ? JSON.parse(savedPosition) : { x: 0, y: 0 };
  });

  const [previousPosition, setPreviousPosition] = useState({ x: 20, y: 20 });
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousSize, setPreviousSize] = useState(size);
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

    // 如果整大小的方向包含 'left'，则需要调整位置
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
    e.preventDefault();
    if ((e.target as HTMLElement).classList.contains('handle')) {
      isDraggingRef.current = true;
      startPosRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  }, [position]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
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

  const handleMinimize = () => {
    if (!isMinimized) {
      setPreviousSize(size);
      setSize({ width: 240, height: 200 }); // 修改这里
      setIsMinimized(true);
      setIsMaximized(false);
    } else {
      setSize(previousSize);
      setIsMinimized(false);
    }
  };

  const handleMaximize = () => {
    if (!isMaximized) {
      setPreviousSize(size);
      setPreviousPosition(position);
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      setPosition({ x: 0, y: 0 }); // 设置左上角为 (0, 0)
      setIsMaximized(true);
      setIsMinimized(false);
    } else {
      setSize(previousSize);
      setPosition(previousPosition);
      setIsMaximized(false);
    }
  };

  const resizableProps: ResizableProps = {
    size: isMaximized ? { width: window.innerWidth, height: window.innerHeight } : size,
    onResizeStop: handleResize,
    minWidth: 240,
    minHeight: 200,
    maxWidth: window.innerWidth,
    maxHeight: window.innerHeight,
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

  useEffect(() => {
    return () => {
      localStorage.setItem('appSize', JSON.stringify(size));
      localStorage.setItem('appPosition', JSON.stringify(position));
    };
  }, [size, position]);

  return (
    <CanvasProvider>
      <AppContainer ref={containerRef}>
        <CanvasContainer>
          <Canvas />
        </CanvasContainer>
      </AppContainer>
    </CanvasProvider>
  );
};

export default App;