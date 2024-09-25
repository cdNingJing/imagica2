import create from 'zustand';
import { persist } from 'zustand/middleware';

interface DataStore {
  imageUrls: string[];
  description: string;
  updateImageUrls: (newImageUrls: string[]) => void;
  updateDescription: (newDescription: string) => void;
  resetStore: () => void;
}

const initialState = {
  imageUrls: [],
  description: '',
};

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      ...initialState,
      updateImageUrls: (newImageUrls) => set({ imageUrls: newImageUrls }),
      updateDescription: (newDescription) => set({ description: newDescription }),
      resetStore: () => set(initialState),
    }),
    {
      name: 'data-store', // 用于 localStorage 的 key
    }
  )
);