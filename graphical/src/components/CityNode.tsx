import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { updateTravelItinerary } from '../store/travelItinerary';
import './CityNode.css';

const CityNode: React.FC<NodeProps> = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(data.city.name);
  const [duration, setDuration] = useState(data.city.duration);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cityName') {
      setName(value);
    } else if (name === 'cityDuration') {
      setDuration(value);
    }
  };

  const handleSave = useCallback(() => {
    setIsEditing(false);
    updateTravelItinerary((draft) => {
      const city = draft.cities.find((c: any) => c.id === data.city.id);
      if (city) {
        city.name = name;
        city.duration = duration;
      }
    });
  }, [data.city.id, name, duration]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setName(data.city.name);
    setDuration(data.city.duration);
  }, [data.city.name, data.city.duration]);

  return (
    <div className="city-node" ref={nodeRef} onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Left} />
      <div className="city-node-content">
        {isEditing ? (
          <div className="edit-popup">
            <input
              type="text"
              name="cityName"
              value={name}
              onChange={handleInputChange}
              className="city-name-input"
              placeholder="城市名称"
            />
            <input
              type="text"
              name="cityDuration"
              value={duration}
              onChange={handleInputChange}
              className="city-duration-input"
              placeholder="停留时间"
            />
            <div className="button-group">
              <button onClick={handleSave} className="save-btn">确认</button>
              <button onClick={handleCancel} className="cancel-btn">取消</button>
            </div>
          </div>
        ) : (
          <>
            <div className="city-name">{data.city.name}</div>
            <div className="city-duration">{data.city.duration}</div>
          </>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CityNode;
