import { useSensorStore } from '../store/useSensorStore';

let intervalId: ReturnType<typeof setInterval> | null = null;

// Simulate a random walk for realistic looking data
let currentBpm = 65;
let currentEda = 2.5;
let currentPpg = 50000;

export const startMockSensor = () => {
  if (intervalId) return;

  useSensorStore.getState().setStatus('connected');

  intervalId = setInterval(() => {
    // Add some noise and drift
    const bpmDrift = (Math.random() - 0.5) * 2;
    const edaDrift = (Math.random() - 0.5) * 0.1;
    const ppgNoise = (Math.random() - 0.5) * 1000;

    currentBpm = Math.max(40, Math.min(180, currentBpm + bpmDrift));
    currentEda = Math.max(0.5, Math.min(10, currentEda + edaDrift));
    currentPpg = 50000 + Math.sin(Date.now() / 500) * 5000 + ppgNoise;

    // Simulate occasional poor signal (bpm drops to 0)
    const isPoorSignal = Math.random() < 0.02;

    useSensorStore.getState().addPoint({
      timestamp: Date.now(),
      bpm: isPoorSignal ? 0 : Math.round(currentBpm),
      eda: Number(currentEda.toFixed(2)),
      ppg_ir: Math.round(currentPpg),
      device_id: 'device_001',
    });
  }, 1000); // 1 update per second
};

export const stopMockSensor = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  useSensorStore.getState().setStatus('disconnected');
};
