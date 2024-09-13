import React from 'react';
import styled from 'styled-components';

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
`;

const Canvas: React.FC = () => {
  return (
    <CanvasContainer>
      {/* 这里可以添加画布的具体实现 */}
    </CanvasContainer>
  );
};

export default Canvas;