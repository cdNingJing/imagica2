import React from 'react';
import { format } from 'date-fns';

interface Attraction {
  name: string;
  visitDate: string;
  duration: string;
  ticketPrice: number;
  description: string;
}

interface Activity {
  name: string;
  location: string;
  date: string;
  duration: string;
  cost: number;
  description: string;
}

interface Transportation {
  type: string;
  from: string;
  to: string;
  date: string;
  cost: number;
}

interface City {
  name: string;
  duration: string;
  accommodation: {
    name: string;
    address: string;
    checkIn: string;
    checkOut: string;
    price: number;
  };
  attractions: Attraction[];
  transportation: {
    type: string;
    cost: number;
  };
}

interface Itinerary {
  tripName: string;
  duration: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  cities: City[];
  activities: Activity[];
  transportation: Transportation[];
  notes: string[];
}

interface ItineraryDisplayProps {
  itinerary: Itinerary;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd (EEE)');
  };

  const getDayNumber = (date: string) => {
    const start = new Date(itinerary.startDate);
    const current = new Date(date);
    const diffTime = Math.abs(current.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  return (
    <div className="itinerary-display">
      <h1>{itinerary.tripName}</h1>
      <p>行程：{itinerary.duration} ({formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)})</p>
      <p>预算：{itinerary.budget} 元 | 旅行人数：{itinerary.travelers} 人</p>

      <div className="timeline">
        {itinerary.cities.map((city, cityIndex) => (
          <div key={cityIndex} className="city-section">
            <h2>{city.name} ({city.duration})</h2>
            {city.accommodation ? (
              <>
                <p>住宿：{city.accommodation.name} ({formatDate(city.accommodation.checkIn)} - {formatDate(city.accommodation.checkOut)})</p>
                <p>地址：{city.accommodation.address} | 价格：{city.accommodation.price} 元/晚</p>
              </>
            ) : (
              <p>此城市无住宿安排</p>
            )}

            {city.attractions.map((attraction, attrIndex) => (
              <div key={attrIndex} className="event">
                <div className="event-date">第 {getDayNumber(attraction.visitDate)} 天</div>
                <div className="event-content">
                  <h3>{attraction.name}</h3>
                  <p>时间：{formatDate(attraction.visitDate)} | 持续：{attraction.duration}</p>
                  <p>门票：{attraction.ticketPrice} 元 | {attraction.description}</p>
                </div>
              </div>
            ))}

            {city.transportation && (
              <p>当地交通：{city.transportation.type} (预估费用：{city.transportation.cost} 元)</p>
            )}
          </div>
        ))}

        {itinerary.activities.map((activity, actIndex) => (
          <div key={actIndex} className="event">
            <div className="event-date">第 {getDayNumber(activity.date)} 天</div>
            <div className="event-content">
              <h3>{activity.name}</h3>
              <p>地点：{activity.location} | 时间：{formatDate(activity.date)} | 持续：{activity.duration}</p>
              <p>费用：{activity.cost} 元 | {activity.description}</p>
            </div>
          </div>
        ))}

        {itinerary.transportation.map((transport, transIndex) => (
          <div key={transIndex} className="event">
            <div className="event-date">第 {getDayNumber(transport.date)} 天</div>
            <div className="event-content">
              <h3>{transport.type}</h3>
              <p>从 {transport.from} 到 {transport.to} | 时间：{formatDate(transport.date)}</p>
              <p>费用：{transport.cost} 元</p>
            </div>
          </div>
        ))}
      </div>

      <div className="notes">
        <h3>注意事项：</h3>
        <ul>
          {itinerary.notes.map((note, noteIndex) => (
            <li key={noteIndex}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ItineraryDisplay;