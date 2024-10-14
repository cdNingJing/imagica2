import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const CustomTextNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{
      padding: '10px',
      borderRadius: '3px',
      width: 150,
      fontSize: '12px',
      color: '#222',
      textAlign: 'center',
      border: '1px solid #1a192b',
      backgroundColor: 'white'
    }}>
      <Handle type="target" position={Position.Left} />
      {data.label}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomTextNode;