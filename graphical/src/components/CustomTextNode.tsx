import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { updateTravelItinerary } from '../store/travelItinerary';
import './CustomTextNode.css';

interface CustomData {
  type: 'cities' | 'activities' | 'transportation';
  city?: any;
  activity?: any;
  transport?: any;
}

const CustomTextNode: React.FC<NodeProps<CustomData>> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(getInitialLabel());

  function getInitialLabel() {
    switch (data.type) {
      case 'cities':
        return `${data.city.name}\n${data.city.duration}`;
      case 'activities':
        return `${data.activity.name}\n${data.activity.duration}`;
      case 'transportation':
        return `${data.transport.type}\n${data.transport.from} to ${data.transport.to}`;
      default:
        return '';
    }
  }

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLabel(event.target.value);
  };

  const handleInputBlur = useCallback(() => {
    setIsEditing(false);
    
    updateTravelItinerary((draft) => {
      const [newName, newDuration] = label.split('\n');
      switch (data.type) {
        case 'cities':
          const city = draft.cities.find((c: any) => c.name === data.city.name);
          if (city) {
            city.name = newName;
            city.duration = newDuration || city.duration;
          }
          break;
        case 'activities':
          const activity = draft.activities.find((a: any) => a.name === data.activity.name);
          if (activity) {
            activity.name = newName;
            activity.duration = newDuration || activity.duration;
          }
          break;
        case 'transportation':
          const transport = draft.transportation.find((t: any) => t.type === data.transport.type);
          if (transport) {
            const [newType, newRoute] = newName.split('\n');
            transport.type = newType;
            const [newFrom, newTo] = newRoute.split(' to ');
            transport.from = newFrom;
            transport.to = newTo;
          }
          break;
      }
    });
  }, [data, id, label]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleInputBlur();
    }
  };

  return (
    <div className="custom-node" onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Left} />
      {isEditing ? (
        <textarea
          value={label}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          autoFocus
          className="node-input"
          rows={2}
        />
      ) : (
        <div className="node-label">{label}</div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomTextNode;
