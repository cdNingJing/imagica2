// 定义可能的数据类型
type DataType = 'time' | 'date' | 'location' | 'unknown';

// 定义结构化数据的接口
export interface FormattedData {
  type: DataType;
  value: string;
  metadata?: Record<string, any>;
}

export function formatData(data: string, type?: DataType): FormattedData {
  // 如果没有指定类型,尝试推断类型
  if (!type) {
    type = inferDataType(data);
  }

  switch (type) {
    case 'time':
      return formatTime(data);
    case 'date':
      return formatDate(data);
    case 'location':
      return formatLocation(data);
    default:
      return { type: 'unknown', value: data };
  }
}

function inferDataType(data: string): DataType {
  if (/^\d{1,2}:\d{2}$/.test(data)) return 'time';
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) return 'date';
  // 可以添加更多的推断逻辑
  return 'unknown';
}

function formatTime(time: string): FormattedData {
  const [hours, minutes] = time.split(':').map(Number);
  return {
    type: 'time',
    value: time,
    metadata: {
      hours,
      minutes,
      isAM: hours < 12
    }
  };
}

function formatDate(date: string): FormattedData {
  const [year, month, day] = date.split('-').map(Number);
  return {
    type: 'date',
    value: date,
    metadata: {
      year,
      month,
      day
    }
  };
}

function formatLocation(location: string): FormattedData {
  // 这里可以添加更复杂的位置处理逻辑
  return {
    type: 'location',
    value: location
  };
}

export function processDataForImageGeneration(inputData: string[]): FormattedData[] {
  return inputData.map(data => formatData(data));
}