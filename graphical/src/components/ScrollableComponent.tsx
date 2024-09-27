import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './ScrollableComponent.css';
import { useDataStore } from '../store/data-store';
import { callAIService } from '../api/aiService'

interface ScheduleItem {
  time: string;
  activity: string;
}

interface DaySchedule {
  day: string;
  schedule: ScheduleItem[];
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

export const ScrollableComponent: React.FC<any> = ({ data }) => {
  const [isToggled, setIsToggled] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { imageUrls, description, updateImageUrls, updateDescription } = useDataStore();

  const debouncedAiResponse = useDebounce(aiResponse, 300); // 300ms 延迟

  const handleToggleA = useCallback(() => setIsToggled(true), []);
  const handleToggleB = useCallback(() => setIsToggled(false), []);

  const parseSchedule = useCallback((response: string): DaySchedule[] => {
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

  const schedule = useMemo(() => parseSchedule(debouncedAiResponse), [debouncedAiResponse, parseSchedule]);

  const fetchData = useCallback(async () => {
    if (!data.centerText) return;

    const contents = `
      您是专业的智能管家，需要将行程安排成合理的时间表。请严格按照以下JSON格式返回：
      [
        {
          "day": "第1天",
          "schedule": [
            {"time": "08:00", "activity": "具体活动"},
            {"time": "09:30", "activity": "具体活动"},
            {"time": "12:00", "activity": "具体活动"},
            {"time": "13:30", "activity": "具体活动"},
            {"time": "17:00", "activity": "具体活动"},
            {"time": "18:30", "activity": "具体活动"}
          ]
        }
      ]
      请根据用户提供的信息，填充具体的活动内容。只返回JSON数据，不要添加任何额外的文字说明。
    `;

    setIsLoading(true);
    setAiResponse('');

    try {
      const aiStream = callAIService(data.centerText, contents, true);
      let fullResponse = '';
      for await (const chunk of aiStream) {
        fullResponse += chunk;
        setAiResponse(fullResponse);
      }
    } catch (error) {
      console.error('生成 AI 响应时出错:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data.centerText]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderSchedule = useCallback((scheduleData: DaySchedule[]) => (
    <div className="modern-timeline">
      {scheduleData.map((day, dayIndex) => (
        <div key={dayIndex} className="modern-day">
          <h3 className="modern-day-title">{day.day}</h3>
          <div className="modern-schedule-list">
            {day.schedule.map((item, itemIndex) => (
              <div key={itemIndex} className="modern-schedule-item">
                <div className="modern-time">{item.time}</div>
                <div className="modern-activity">{item.activity}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ), []);

  return (
    <div className="scrollable-component">
      <div className="toggle-button-group">
        <button onClick={handleToggleA} className={`toggle-button ${isToggled ? 'active' : ''}`}>显示图文</button>
        <button onClick={handleToggleB} className={`toggle-button ${!isToggled ? 'active' : ''}`}>显示数据</button>
      </div>
      <div className="content">
        {isToggled ? (
          <div>
            <h2>去云南的旅游路线</h2>
            <img className="chart-image" src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe-img.xhscdn.com%2Fbw%2Fc7a6709c-ce99-404c-9866-00c7e3db5523%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fsafe-img.xhscdn.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1729934074&t=7556ed3ea36603972f1d503527dd7ac9" alt="" />
          </div>
        ) : (
          <div className="modern-schedule-container">
            <h2 className="modern-title">{data.title}</h2>
            {isLoading ? (
              <div className="loading-container">
                <div className="wave-loader">
                  <div className="wave-loader__wave"></div>
                  <div className="wave-loader__wave"></div>
                  <div className="wave-loader__wave"></div>
                  <div className="wave-loader__wave"></div>
                  <div className="wave-loader__wave"></div>
                  <div className="wave-loader__wave"></div>
                </div>
              </div>
            ) : schedule.length > 0 ? (
              renderSchedule(schedule)
            ) : (
              <p>暂无数据</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};