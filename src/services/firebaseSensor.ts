import { ref, onValue, query, limitToLast, off } from 'firebase/database';
import { db } from '../lib/firebase';
import { useSensorStore } from '../store/useSensorStore';

let isListening = false;
let readingsRef: any = null;
let stressRef: any = null;

export function startFirebaseSensor() {
  if (isListening) return;
  isListening = true;

  const { setStatus, setStress } = useSensorStore.getState();
  setStatus('connecting');

  // Query the last 50 readings from device_001
  readingsRef = query(ref(db, 'readings/device_001'), limitToLast(50));

  onValue(readingsRef, (snapshot) => {
    if (snapshot.exists()) {
      setStatus('connected');
      const data = snapshot.val();
      
      // Convert the object of push IDs into an array of DataPoints
      const points = Object.values(data).map((val: any) => ({
        timestamp: val.timestamp * 1000,
        eda: val.eda,
        ppg: val.ppg_ir
      })).sort((a, b) => a.timestamp - b.timestamp);

      // Update the store with the latest history and current point
      useSensorStore.setState({
        history: points,
        current: points[points.length - 1]
      });
    } else {
      setStatus('poor_signal');
    }
  }, (error) => {
    console.error("Firebase DB Error:", error);
    setStatus('disconnected');
  });

  // Query the last 50 stress scores
  stressRef = query(ref(db, 'readings/stress_score'), limitToLast(50));

  onValue(stressRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Convert the object of push IDs into an array of StressPoints
      const points = Object.values(data)
        .filter((val: any) => val.device_id === 'device_001')
        .map((val: any) => ({
          timestamp: val.timestamp * 1000,
          weightedStress: val.weighted_stress,
          objectiveScore: val.objective_score,
          subjectiveScore: val.subjective_score
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

      if (points.length > 0) {
        useSensorStore.setState({
          stressHistory: points,
          currentStress: points[points.length - 1]
        });
      }
    }
  }, (error) => {
    console.error("Firebase Stress DB Error:", error);
  });
}

export function stopFirebaseSensor() {
  if (!isListening) return;
  isListening = false;
  
  if (readingsRef) {
    off(readingsRef);
    readingsRef = null;
  }

  if (stressRef) {
    off(stressRef);
    stressRef = null;
  }
  
  useSensorStore.getState().setStatus('disconnected');
}
