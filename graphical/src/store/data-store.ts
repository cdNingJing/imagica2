import { useState, useEffect } from 'react';

interface DataStore {
  imageUrls: string;
  description: string;
}

function useDataStore() {
  const [data, setData] = useState<DataStore>(() => {
    // 从 localStorage 中获取初始数据
    const savedData = localStorage.getItem('dataStore');
    return savedData ? JSON.parse(savedData) : { imageUrls: '', description: '' };
  });

  useEffect(() => {
    // 将数据保存到 localStorage
    localStorage.setItem('dataStore', JSON.stringify(data));
  }, [data]);

  return { data, setData };
}

export { useDataStore };