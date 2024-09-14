import { create } from 'zustand'

export interface ShapeData {
  id: string;
  text: string;
  shapeType: 'circle' | 'rectangle' | 'triangle';
  layer: number;
  x: number;
  y: number;
  zIndex: number;
  width?: number;
  height?: number;
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
    { id: '1', text: '生成一个闹钟', shapeType: 'circle', layer: 0, x: 20, y: 0, zIndex: 0 },
    { id: '2', text: 'React + D3', shapeType: 'rectangle', layer: 0, x: 20, y: 200, zIndex: 1 },
    { id: '3', text: 'Awesome', shapeType: 'triangle', layer: 0, x: 20, y: 400, zIndex: 2 },
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