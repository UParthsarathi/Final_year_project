import { create } from 'zustand';

export interface DataPoint {
  timestamp: number;
  ppg: number;
  eda: number;
}

interface SensorState {
  current: DataPoint | null;
  history: DataPoint[];
  status: 'connected' | 'disconnected' | 'poor_signal' | 'connecting';
  addPoint: (point: DataPoint) => void;
  setStatus: (status: 'connected' | 'disconnected' | 'poor_signal' | 'connecting') => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 300; // Keep last 5 minutes (assuming 1 point/sec)

export const useSensorStore = create<SensorState>((set) => ({
  current: null,
  history: [],
  status: 'disconnected',
  addPoint: (point) =>
    set((state) => {
      const newHistory = [...state.history, point];
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return {
        current: point,
        history: newHistory,
        status: point.ppg === 0 ? 'poor_signal' : 'connected',
      };
    }),
  setStatus: (status) => set({ status }),
  clearHistory: () => set({ history: [], current: null }),
}));
