import create from 'zustand';

interface NodeState {
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
}

export const useNodeStore = create<NodeState>((set) => ({
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));