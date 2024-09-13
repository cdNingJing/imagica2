import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Toast = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.3s;
`;

interface ToastMessageProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return <Toast $isVisible={isVisible}>{message}</Toast>;
};

export default ToastMessage;