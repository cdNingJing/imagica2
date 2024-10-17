import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { updateTravelItinerary } from '../store/travelItinerary';
import './AttractionNode.css';

interface AttractionData {
  id: string;
  name: string;
  visitDate: string;
  duration: string;
  ticketPrice: number;
  description: string;
}

interface AttractionNodeProps {
  data: {
    attraction: AttractionData;
  };
}

const AttractionNode: React.FC<AttractionNodeProps> = ({ data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(data.attraction.name);
  const [visitDate, setVisitDate] = useState(data.attraction.visitDate);
  const [duration, setDuration] = useState(data.attraction.duration);
  const [ticketPrice, setTicketPrice] = useState(data.attraction.ticketPrice);
  const [description, setDescription] = useState(data.attraction.description);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(data.attraction.name);
    setVisitDate(data.attraction.visitDate);
    setDuration(data.attraction.duration);
    setTicketPrice(data.attraction.ticketPrice);
    setDescription(data.attraction.description);
  }, [data.attraction]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'attractionName':
        setName(value);
        break;
      case 'visitDate':
        setVisitDate(value);
        break;
      case 'duration':
        setDuration(value);
        break;
      case 'ticketPrice':
        setTicketPrice(Number(value));
        break;
      case 'description':
        setDescription(value);
        break;
    }
  };

  const handleSave = useCallback(() => {
    setIsEditing(false);
    updateTravelItinerary((draft) => {
      const city = draft.cities.find((c: any) => c.attractions.some((a: any) => a.id === data.attraction.id));
      if (city) {
        const attraction = city.attractions.find((a: any) => a.id === data.attraction.id);
        if (attraction) {
          attraction.name = name;
          attraction.visitDate = visitDate;
          attraction.duration = duration;
          attraction.ticketPrice = ticketPrice;
          attraction.description = description;
        }
      }
      return draft;
    });
  }, [data.attraction.id, name, visitDate, duration, ticketPrice, description]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setName(data.attraction.name);
    setVisitDate(data.attraction.visitDate);
    setDuration(data.attraction.duration);
    setTicketPrice(data.attraction.ticketPrice);
    setDescription(data.attraction.description);
  }, [data.attraction]);

  return (
    <div className="attraction-node" ref={nodeRef} onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Left} />
      <div className="attraction-node-content">
        {isEditing ? (
          <div className="edit-popup">
            <input
              type="text"
              name="attractionName"
              value={name}
              onChange={handleInputChange}
              className="attraction-name-input"
              placeholder="景点名称"
            />
            <input
              type="text"
              name="visitDate"
              value={visitDate}
              onChange={handleInputChange}
              className="visit-date-input"
              placeholder="参观日期"
            />
            <input
              type="text"
              name="duration"
              value={duration}
              onChange={handleInputChange}
              className="duration-input"
              placeholder="游览时长"
            />
            <input
              type="number"
              name="ticketPrice"
              value={ticketPrice}
              onChange={handleInputChange}
              className="ticket-price-input"
              placeholder="门票价格"
            />
            <textarea
              name="description"
              value={description}
              onChange={handleInputChange}
              className="description-input"
              placeholder="景点描述"
            />
            <div className="button-group">
              <button onClick={handleSave} className="save-btn">确认</button>
              <button onClick={handleCancel} className="cancel-btn">取消</button>
            </div>
          </div>
        ) : (
          <></>
        )}
        <>
          <div className="attraction-node__title">{name}</div>
          <div className="attraction-node__info">日期：{visitDate}</div>
          <div className="attraction-node__info">时长：{duration}</div>
          <div className="attraction-node__info">门票：¥{ticketPrice}</div>
          <div className="attraction-node__description">{description}</div>
        </>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default AttractionNode;
