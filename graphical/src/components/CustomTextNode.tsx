import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { updateTravelItinerary, travelItinerary } from '../store/travelItinerary';
import './CustomTextNode.css';

const CustomTextNode: React.FC<NodeProps> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
  };

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    
    console.log('更新前的行程数据:', JSON.stringify(travelItinerary, null, 2));
    
    updateTravelItinerary((draft) => {
      const updateEntity = (entities: any[]) => {
        const entity = entities.find(e => e.id === id);
        if (entity) {
          const [newName, newDuration] = label.split('\n');
          entity.name = newName;
          if (entity.duration) {
            entity.duration = newDuration || entity.duration;
          }
          return true;
        }
        return false;
      };

      if (!updateEntity(draft.cities) && !updateEntity(draft.activities)) {
        // 如果不是城市或活动，可能是景点
        draft.cities.some((city: any) => updateEntity(city.attractions));
      }
    });

    console.log('更新后的行程数据:', JSON.stringify(travelItinerary, null, 2));
  }, [id, label]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div className="custom-node" onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Left} />
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          autoFocus
          className="node-input"
        />
      ) : (
        <span className="node-label">{label}</span>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomTextNode;