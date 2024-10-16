import { v4 as uuidv4 } from 'uuid';  // 需要安装 uuid 包
import { produce } from 'immer';

export let travelItinerary = {
  id: uuidv4(),
  tripName: "日本关西地区深度游",
  duration: "7天6晚",
  startDate: "2023-10-01",
  endDate: "2023-10-07",
  budget: 15000, // 单位：人民币
  travelers: 2,
  cities: [
    {
      id: uuidv4(),
      name: "大阪",
      duration: "2天",
      accommodation: {
        id: uuidv4(),
        name: "大阪日航酒店",
        address: "大阪市中央区西心斋桥1-3-3",
        checkIn: "2023-10-01",
        checkOut: "2023-10-03",
        price: 1200 // 每晚价格，人民币
      },
      attractions: [
        {
          id: uuidv4(),
          name: "大阪城",
          visitDate: "2023-10-01",
          duration: "3小时",
          ticketPrice: 80,
          description: "日本著名古迹，了解日本战国历史"
        },
        {
          id: uuidv4(),
          name: "道顿堀",
          visitDate: "2023-10-01",
          duration: "2小时",
          ticketPrice: 0,
          description: "大阪最热闹的美食街，品尝当地特色小吃"
        },
        {
          id: uuidv4(),
          name: "大阪水族馆",
          visitDate: "2023-10-02",
          duration: "4小时",
          ticketPrice: 180,
          description: "世界级水族馆，可以看到鲸鲨等海洋生物"
        }
      ],
      transportation: {
        id: uuidv4(),
        type: "地铁",
        cost: 60 // 估计两天地铁费用
      }
    },
    {
      id: uuidv4(),
      name: "京都",
      duration: "3天",
      accommodation: {
        id: uuidv4(),
        name: "京都四季酒店",
        address: "京都市东山区妙法院前町445-3",
        checkIn: "2023-10-03",
        checkOut: "2023-10-06",
        price: 2000 // 每晚价格，人民币
      },
      attractions: [
        {
          id: uuidv4(),
          name: "伏见稻荷大社",
          visitDate: "2023-10-03",
          duration: "3小时",
          ticketPrice: 0,
          description: "著名的千本鸟居，体验日本神道文化"
        },
        {
          id: uuidv4(),
          name: "金阁寺",
          visitDate: "2023-10-04",
          duration: "2小时",
          ticketPrice: 100,
          description: "京都标志性建筑，欣赏日本园林艺术"
        },
        {
          id: uuidv4(),
          name: "岚山竹林",
          visitDate: "2023-10-05",
          duration: "4小时",
          ticketPrice: 0,
          description: "漫步竹林小径，感受日本自然之美"
        },
        {
          id: uuidv4(),
          name: "清水寺",
          visitDate: "2023-10-05",
          duration: "3小时",
          ticketPrice: 90,
          description: "世界文化遗产，欣赏古都风貌"
        }
      ],
      transportation: {
        id: uuidv4(),
        type: "公交巴士",
        cost: 100 // 估计三天公交费用
      }
    },
    {
      id: uuidv4(),
      name: "奈良",
      duration: "1天",
      attractions: [
        {
          id: uuidv4(),
          name: "奈良公园",
          visitDate: "2023-10-06",
          duration: "3小时",
          ticketPrice: 0,
          description: "与小鹿互动，参观东大寺"
        },
        {
          id: uuidv4(),
          name: "春日大社",
          visitDate: "2023-10-06",
          duration: "2小时",
          ticketPrice: 70,
          description: "世界文化遗产，欣赏古代建筑"
        }
      ],
      transportation: {
        id: uuidv4(),
        type: "JR线",
        cost: 140 // 往返京都-奈良
      }
    }
  ],
  activities: [
    {
      id: uuidv4(),
      name: "和服体验",
      location: "京都",
      date: "2023-10-04",
      duration: "2小时",
      cost: 300,
      description: "穿着和服漫步古都街道"
    },
    {
      id: uuidv4(),
      name: "茶道体验",
      location: "京都",
      date: "2023-10-05",
      duration: "1.5小时",
      cost: 250,
      description: "学习日本传统茶道"
    },
    {
      id: uuidv4(),
      name: "寿司制作课程",
      location: "大阪",
      date: "2023-10-02",
      duration: "2小时",
      cost: 400,
      description: "学习制作正宗日本寿司"
    }
  ],
  transportation: [
    {
      id: uuidv4(),
      type: "国际航班",
      from: "上海",
      to: "大阪",
      date: "2023-10-01",
      cost: 2500
    },
    {
      id: uuidv4(),
      type: "国际航班",
      from: "大阪",
      to: "上海",
      date: "2023-10-07",
      cost: 2500
    },
    {
      id: uuidv4(),
      type: "新干线",
      from: "大阪",
      to: "京都",
      date: "2023-10-03",
      cost: 280
    }
  ],
  notes: [
    "记得购买JR关西地区通票",
    "准备舒适的步行鞋，京都景点间距离较远",
    "请提前预约和服体验和寿司制作课程",
    "在奈良公园注意保管好个人物品，小鹿可能会抢夺食物"
  ]
};

export const updateTravelItinerary = (updater: (draft: any) => void) => {
  travelItinerary = produce(travelItinerary, updater);
};
