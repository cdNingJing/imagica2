import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './ScrollableComponent.css';
import { useShapeStore } from '../store/ShapeStore';
import { callAIService } from '../api/aiService'
import WaveLoader from './WaveLoader';
import TripMap from './TripMap';
import ItineraryDisplay from './ItineraryDisplay';
interface ScheduleItem {
  time: string;
  activity: string;
}
// 自定义 debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const convertItineraryToSchedule = (itinerary: any): any[] => {
  const startDate = new Date(itinerary.startDate);
  const endDate = new Date(itinerary.endDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;

  return Array.from({ length: totalDays }, (_, index) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);
    const formattedDate = currentDate.toISOString().split('T')[0];

    const city = itinerary.cities.find((city: any) => {
      const checkIn = new Date(city.accommodation?.checkIn);
      const checkOut = new Date(city.accommodation?.checkOut);
      return currentDate >= checkIn && currentDate < checkOut;
    });

    const schedule = [];

    // 添加早晨开始的活动
    schedule.push({ time: "08:00", activity: `在${city?.name || '当前城市'}开始新的一天` });

    // 添加景点参观
    if (city) {
      const attractions = city.attractions.filter((attraction: any) => 
        attraction.visitDate === formattedDate
      );
      attractions.forEach((attraction: any, i: number) => {
        const time = new Date(currentDate);
        time.setHours(9 + i * 2, 0, 0); // 假设每个景点间隔2小时
        schedule.push({
          time: time.toTimeString().slice(0, 5),
          activity: `参观${attraction.name} (${attraction.duration})`
        });
      });
    }

    // 添加当天的活动
    const dayActivities = itinerary.activities.filter((activity: any) => 
      activity.date === formattedDate
    );
    dayActivities.forEach((activity: any, i: number) => {
      const time = new Date(currentDate);
      time.setHours(14 + i, 30, 0); // 假设下午2:30开始，每个活动间隔1小时
      schedule.push({
        time: time.toTimeString().slice(0, 5),
        activity: `${activity.name} (${activity.duration})`
      });
    });

    // 添加交通安排
    const transportations = itinerary.transportation.filter((transport: any) => 
      transport.date === formattedDate
    );
    transportations.forEach((transport: any) => {
      schedule.push({
        time: "12:00", // 假设所有交通安排在中午12点
        activity: `从${transport.from}到${transport.to}的${transport.type}`
      });
    });

    // 添加入住信息
    if (city && city.accommodation && city.accommodation.checkIn === formattedDate) {
      schedule.push({ 
        time: "20:00", 
        activity: `入住${city.accommodation.name}` 
      });
    }

    // 按时间排序
    schedule.sort((a, b) => a.time.localeCompare(b.time));

    return {
      day: `第${index + 1}天 (${formattedDate})`,
      schedule: schedule
    };
  });
};

export const ScrollableComponent: React.FC<any> = ({ data }) => {
  const [isToggled, setIsToggled] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updateShapeSchedule, getShapeByTitle} = useShapeStore();
  const [schedule, setSchedule] = useState<any[]>([]);

  const debouncedAiResponse = useDebounce(aiResponse, 300); // 300ms 延迟

  const handleToggleA = useCallback(() => setIsToggled(true), []);
  const handleToggleB = useCallback(() => setIsToggled(false), []);

  const parseSchedule = useCallback((response: string): any[] => {
    try {
      const parsedSchedule = JSON.parse(response);
      if (Array.isArray(parsedSchedule) && parsedSchedule.length > 0) {
        return parsedSchedule;
      }
    } catch (error) {
      // JSON 解析失败，尝试部分解析
    }

    const dayRegex = /"day":\s*"([^"]+)"/;
    const scheduleItemRegex = /"time":\s*"([^"]+)",\s*"activity":\s*"([^"]+)"/g;
    const days = response.split('"day":').slice(1);
    
    return days.map(day => {
      const dayMatch = day.match(dayRegex);
      const scheduleItems = Array.from(day.matchAll(scheduleItemRegex));
      
      return {
        day: dayMatch ? dayMatch[1] : '未知日期',
        schedule: scheduleItems.map(item => ({
          time: item[1],
          activity: item[2]
        }))
      };
    }).filter(day => day.schedule.length > 0);
  }, []);

  useEffect(() => {
    console.log("travelItinerary data:", data);
    if (data.itinerary) {
      const convertedSchedule = convertItineraryToSchedule(data.itinerary);
      setSchedule(convertedSchedule);
      
      const extractedLocations = data.itinerary.cities.map((city: any) => ({
        name: city?.name || '成都',
        lat: city?.latitude || 30.572816,
        lng: city?.longitude || 104.066801
      }));
      setLocations(extractedLocations);
    }
  }, [data]);

  const defaultLocations: any[] = [
    { name: "大阪", lat: 34.6937, lng: 135.5023 },
    { name: "京都", lat: 35.0116, lng: 135.7681 },
    { name: "奈良", lat: 34.6851, lng: 135.8048 },
    { name: "大阪", lat: 34.6937, lng: 135.5023 },
  ];

  return (
    <div className="scrollable-component" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <div className="toggle-button-group">
        <button onClick={handleToggleA} className={`toggle-button ${isToggled ? 'active' : ''}`}>显示图文</button>
        <button onClick={handleToggleB} className={`toggle-button ${!isToggled ? 'active' : ''}`}>显示数据</button>
      </div>
      <div className="content">
        {isToggled ? (
          <div>
            <h2>{data.itinerary?.tripName}</h2>
            <TripMap locations={locations.length > 0 ? locations : defaultLocations} />
          </div>
        ) : (
          <div className="modern-schedule-container">
            <h2 className="modern-title">{data.title}</h2>
            {isLoading ? (<WaveLoader />) : schedule.length > 0 ? (
              <ItineraryDisplay itinerary={data.itinerary} />
            ) : (
              <p>暂无数据</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
