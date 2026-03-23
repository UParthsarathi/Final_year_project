import { ref, onValue, query, limitToLast, off } from 'firebase/database';
import { db } from '../lib/firebase';
import { useSensorStore } from '../store/useSensorStore';

let isListening = false;
let readingsRef: any = null;

export function startFirebaseSensor() {
  if (isListening) return;
  isListening = true;

  const { setStatus } = useSensorStore.getState();
  setStatus('connecting');

  // Query the last 50 readings from device_001
  readingsRef = query(ref(db, 'readings/device_001'), limitToLast(50));

  onValue(readingsRef, (snapshot) => {
    if (snapshot.exists()) {
      setStatus('connected');
      const data = snapshot.val();
      
      // Convert the object of push IDs into an array of DataPoints
      const points = Object.values(data).map((val: any) => ({
        // The timestamp in the DB appears to be in seconds (e.g., 1774238926)
        // Multiply by 1000 to convert to milliseconds for JS Date
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
}

export function stopFirebaseSensor() {
  if (!isListening) return;
  isListening = false;
  
  if (readingsRef) {
    off(readingsRef);
    readingsRef = null;
  }
  
  useSensorStore.getState().setStatus('disconnected');
}
