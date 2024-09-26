import { create } from 'zustand'

export interface ShapeData {
  id: string;
  text: string;
  shapeType: 'circle' | 'rectangle' | 'triangle' | 'ellipse' | 'pentagon' | 'hexagon' | 'star' | 'diamond' | 'unknown';
  layer: number;
  x: number;
  y: number;
  zIndex: number;
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface ShapeStore {
  shapes: ShapeData[];
  addShape: (shape: ShapeData) => void;
  updateShape: (id: string, updates: Partial<ShapeData>) => void;
  removeShape: (id: string) => void;
  updateShapePosition: (id: string, x: number, y: number) => void;
  updateShapeLayer: (id: string, newLayer: number) => void;
  updateShapeZIndex: (id: string, newZIndex: number) => void; // 新添加的方法
}

export const useShapeStore = create<ShapeStore>((set) => ({
  shapes: [
    { 
      id: '1', 
      text: '圆形', 
      shapeType: 'circle', 
      layer: 0, 
      x: 20, 
      y: 20, 
      zIndex: 0,
      color: '#FF5733',
      fontSize: 16,
      fontFamily: 'Arial'
    },
    { 
      id: '2', 
      text: '矩形', 
      shapeType: 'rectangle', 
      layer: 0, 
      x: 150, 
      y: 20, 
      zIndex: 1,
      color: '#33FF57',
      fontSize: 18,
      fontFamily: 'Helvetica'
    },
    // { 
    //   id: '3', 
    //   text: '三角形', 
    //   shapeType: 'triangle', 
    //   layer: 0, 
    //   x: 280, 
    //   y: 20, 
    //   zIndex: 2,
    //   color: '#3357FF',
    //   fontSize: 20,
    //   fontFamily: 'Verdana'
    // },
    // { 
    //   id: '4', 
    //   text: '椭圆形', 
    //   shapeType: 'ellipse', 
    //   layer: 0, 
    //   x: 410, 
    //   y: 20, 
    //   zIndex: 3,
    //   color: '#FF33F1',
    //   fontSize: 14,
    //   fontFamily: 'Courier'
    // },
    // { 
    //   id: '5', 
    //   text: '五边形', 
    //   shapeType: 'pentagon', 
    //   layer: 1, 
    //   x: 20, 
    //   y: 150, 
    //   zIndex: 4,
    //   color: '#33FFF1',
    //   fontSize: 22,
    //   fontFamily: 'Times New Roman'
    // },
    // { 
    //   id: '6', 
    //   text: '六边形', 
    //   shapeType: 'hexagon', 
    //   layer: 1, 
    //   x: 150, 
    //   y: 150, 
    //   zIndex: 5,
    //   color: '#F1FF33',
    //   fontSize: 20,
    //   fontFamily: 'Georgia'
    // },
    // { 
    //   id: '7', 
    //   text: '星形', 
    //   shapeType: 'star', 
    //   layer: 1, 
    //   x: 280, 
    //   y: 150, 
    //   zIndex: 6,
    //   color: '#FF3333',
    //   fontSize: 18,
    //   fontFamily: 'Tahoma'
    // },
    // { 
    //   id: '8', 
    //   text: '菱形', 
    //   shapeType: 'diamond', 
    //   layer: 1, 
    //   x: 410, 
    //   y: 150, 
    //   zIndex: 7,
    //   color: '#33FFFF',
    //   fontSize: 16,
    //   fontFamily: 'Trebuchet MS'
    // },
    // {
    //   id: '9',
    //   text: 'A triangle and a rectangle.',
    //   shapeType: 'diamond',
    //   layer: 0,
    //   color: '#000000',
    //   colors: ['#007bff', '#ff69b4'],
    //   fontColor: '#000000',
    //   fontFamily: 'Arial',
    //   fontSize: 14,
    //   size: 50,
    //   x: 192.69196453306836,
    //   y: 360.9897151567526,
    //   zIndex: 9,
    //   shapes: []
    // }
  ],
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
}))