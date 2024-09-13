import React, { createContext, useState, useContext, ReactNode } from 'react';

interface CanvasItem {
  id: string;
  type?: string;
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}

interface CanvasContextType {
  items: CanvasItem[];
  addItem: (item: CanvasItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;
  addTestItem: (value: string) => void; // 新增的函数
  updateItemPosition: (id: string, dx: number, dy: number) => void; // 新增的函数定义
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CanvasItem[]>([]);

  const addItem = (item: CanvasItem) => {
    setItems(prevItems => [...prevItems, item]);
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<CanvasItem>) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  // 新增的函数
  const addTestItem = (code: string) => {
    const newItem: CanvasItem = {
      id: Date.now().toString(),
      content: code,
      position: { x: Math.random() * 300, y: Math.random() * 200 }
    };
    addItem(newItem);
  };

  // 在 CanvasStore.tsx 中添加 updateItemPosition 函数
  const updateItemPosition = (id: string, dx: number, dy: number) => {
    setItems(prevItems => prevItems.map(item => 
      item.id === id 
        ? { ...item, position: { x: item.position.x + dx, y: item.position.y + dy } } 
        : item
    ));
  };

  return (
    <CanvasContext.Provider value={{ items, addItem, removeItem, updateItem, addTestItem, updateItemPosition }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};