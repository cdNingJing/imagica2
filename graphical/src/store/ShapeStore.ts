import { create } from 'zustand'

// 定义默认图形类型
type ShapeType = 'circle' | 'rectangle' | 'triangle' | 'ellipse' | 'pentagon' | 'hexagon' | 'star' | 'diamond';

// 默认图形数组
const defaultShapes: { text: string; shapeType: ShapeType }[] = [
  { text: '圆形', shapeType: 'circle' },
  { text: '矩形', shapeType: 'rectangle' },
  { text: '三角形', shapeType: 'triangle' },
  { text: '椭圆形', shapeType: 'ellipse' },
  { text: '五边形', shapeType: 'pentagon' },
  { text: '六边形', shapeType: 'hexagon' },
  { text: '星形', shapeType: 'star' },
  { text: '菱形', shapeType: 'diamond' },
];

const generateRandomColor = (): string => {
  return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
};

export interface ShapeData {
  id: string;
  text: string;
  shapeType: ShapeType;
  layer: number;
  x: number;
  y: number;
  zIndex: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  title?: string;
  centerText?: string;
  isVisible: boolean;
  imageUrl?: string;
  timeline?: string;
  itinerary?: string;
  schedule?: any[];
}

export interface ShapeStore {
  shapes: ShapeData[];
  addRandomShape: (data: Partial<ShapeData>) => void;
  addShape: (shape: ShapeData) => void;
  updateShape: (id: string, updates: Partial<ShapeData>) => void;
  removeShape: (id: string) => void;
  updateShapePosition: (id: string, x: number, y: number) => void;
  updateShapeLayer: (id: string, newLayer: number) => void;
  updateShapeZIndex: (id: string, newZIndex: number) => void; // 新添加的方法
  updateShapeItinerary: (id: string, itinerary: string, title: string, centerText: string) => void; // 新添加的方法
  updateShapeVisibility: (id: string, isVisible: boolean) => void;
  updateShapeImage: (id: string, imageUrl: string) => void;
  updateShapeTimeline: (id: string, timeline: string) => void;
  updateShapeSchedule: (id: string, schedule: any[]) => void;
  getShapeByTitle: (title: string) => any;
}

export const useShapeStore = create<ShapeStore>((set) => ({
  shapes: [{ 
    id: '1', 
    text: '圆形', 
    shapeType: 'circle', 
    isVisible: true,
    layer: 0, 
    x: 20, 
    y: 20, 
    zIndex: 0,
    color: '#FF5733',
    fontSize: 16,
    fontFamily: 'Arial',
    title: "云南七日游",
    centerText: "云南6日游行程图：从昆明出发，乘飞机2小时7分钟到达大理。然后游览洱海古城（2小时13分钟车程），前往东河古镇（20分钟车程）。之后前往香格里拉（4小时7分钟车程），最后到达泸沽湖（4小时车程）。图中用卡通风格的地图标记、汽车、火车和飞机图标展示了旅程路线，并标注了各目的地之间的大致行驶时间。整体背景为浅蓝色，顶部有一个'GO!'的指示牌，突出了旅行的主题。"
  },{ 
    id: '2', 
    text: '圆形', 
    shapeType: 'circle', 
    isVisible: true,
    layer: 0, 
    x: 20, 
    y: 20, 
    zIndex: 0,
    color: '#FF5733',
    fontSize: 16,
    fontFamily: 'Arial',
    title: "云南七日游",
    centerText: "云南6日游行程图：从昆明出发，乘飞机2小时7分钟到达大理。然后游览洱海古城（2小时13分钟车程），前往东河古镇（20分钟车程）。之后前往香格里拉（4小时7分钟车程），最后到达泸沽湖（4小时车程）。图中用卡通风格的地图标记、汽车、火车和飞机图标展示了旅程路线，并标注了各目的地之间的大致行驶时间。整体背景为浅蓝色，顶部有一个'GO!'的指示牌，突出了旅行的主题。"
  },
],
  generateRandomColor: () => {
    return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
  },
  addRandomShape: (data: Partial<ShapeData>) => set((state) => {
    const randomShape = defaultShapes[Math.floor(Math.random() * defaultShapes.length)];
    const newShape: ShapeData = {
      id: Date.now().toString(), // 生成唯一ID
      text: randomShape.text,
      shapeType: randomShape.shapeType,
      color: generateRandomColor(),
      layer: 0,
      x: 250,
      y: 40,
      zIndex: state.shapes.length,
      isVisible: true,
      ...data // 合并传入的数据
    };
    return { shapes: [...state.shapes, newShape] };
  }),
  addShape: (shape) => set((state) => ( { shapes: [...state.shapes, shape] })),
  updateShape: (id, updates) => set((state) => ({
    shapes: state.shapes.map(shape => shape.id === id ? { ...shape, ...updates } : shape)
  })),
  removeShape: (id) => set((state) => ({
    shapes: state.shapes.filter(shape => shape.id !== id)
  })),
  updateShapePosition: (id: string, x: number, y: number) => set((state) => ({
    shapes: state.shapes.map(shape => 
      shape.id === id ? { ...shape, x, y } : shape
    )
  })),
  updateShapeLayer: (id: string, newLayer: number) =>
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, layer: newLayer } : shape
      ),
    })),
  updateShapeZIndex: (id: string, newZIndex: number) => set((state) => ({
    shapes: state.shapes.map((shape) =>
      shape.id === id ? { ...shape, zIndex: newZIndex } : shape
    ),
  })),
  updateShapeItinerary: (id: string, itinerary: string, title: string, centerText: string) => set((state) => ({
    shapes: state.shapes.map((shape) =>
      shape.id === id ? { ...shape, itinerary, title, centerText } : shape
    ),
  })),
  updateShapeVisibility: (id: string, isVisible: boolean) => set((state) => ({
    shapes: state.shapes.map((shape) =>
      shape.id === id ? { ...shape, isVisible } : shape
    ),
  })),
  updateShapeImage: (id: string, imageUrl: string) => set((state) => ({
    shapes: state.shapes.map((shape) =>
      shape.id === id ? { ...shape, imageUrl } : shape
    ),
  })),
  updateShapeTimeline: (id: string, timeline: string) => set((state) => ({
    shapes: state.shapes.map((shape) =>
      shape.id === id ? { ...shape, timeline } : shape
    ),
  })),
  updateShapeSchedule: (id: string, schedule: any[]) => set((state) => ({
    shapes: state.shapes.map((shape) =>
      shape.id === id ? { ...shape, schedule } : shape
    ),
  })),
  getShapeByTitle: (title: string) => set((state) => ({
    shapes: state.shapes.filter((shape) => shape.title === title)
  })),
}))