import { push, ref } from 'firebase/database';
import { db } from '../lib/firebase';
import { useSensorStore } from '../store/useSensorStore';

// These UUIDs must match the ESP32 code exactly
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
const PPG_CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214";
const EDA_CHARACTERISTIC_UUID = "19b10002-e8f2-537e-4f6c-d104768a1214";

let bleDevice: BluetoothDevice | null = null;
let latestPpg = 0;
let latestEda = 0;
let lastPush = 0;

export async function connectBLE() {
  try {
    useSensorStore.getState().setStatus('connecting');
    
    // 1. Request Bluetooth Device from the browser
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }]
    });
    bleDevice = device;

    // Listen for disconnects
    device.addEventListener('gattserverdisconnected', () => {
      useSensorStore.getState().setStatus('disconnected');
    });

    // 2. Connect to the GATT server
    const server = await device.gatt?.connect();
    if (!server) throw new Error("Could not connect to GATT server");

    // 3. Get the Service
    const service = await server.getPrimaryService(SERVICE_UUID);

    // 4. Setup PPG Characteristic (Listen for notifications)
    const ppgChar = await service.getCharacteristic(PPG_CHARACTERISTIC_UUID);
    await ppgChar.startNotifications();
    ppgChar.addEventListener('characteristicvaluechanged', handlePpgChange);

    // 5. Setup EDA Characteristic (Listen for notifications)
    const edaChar = await service.getCharacteristic(EDA_CHARACTERISTIC_UUID);
    await edaChar.startNotifications();
    edaChar.addEventListener('characteristicvaluechanged', handleEdaChange);

    useSensorStore.getState().setStatus('connected');
  } catch (error) {
    console.error("BLE Connection Error:", error);
    useSensorStore.getState().setStatus('disconnected');
    throw error;
  }
}

function handlePpgChange(event: any) {
  const value = event.target.value;
  // Read 4 bytes as an unsigned 32-bit integer (Little Endian)
  latestPpg = value.getUint32(0, true); 
  processAndPushData();
}

function handleEdaChange(event: any) {
  const value = event.target.value;
  latestEda = value.getUint32(0, true);
}

// Throttle Firebase pushes to avoid overwhelming the database
// ESP32 might send data at 100Hz, we'll push to Firebase at ~10Hz
function processAndPushData() {
  const now = Date.now();
  
  // Update local UI immediately (60Hz/100Hz is fine for local state)
  const point = {
    timestamp: now,
    ppg: latestPpg,
    eda: latestEda
  };
  useSensorStore.getState().addPoint(point);

  // Throttle Firebase push to every 100ms
  if (now - lastPush < 100) return; 
  lastPush = now;

  // Push to Firebase Realtime Database
  push(ref(db, 'readings/device_001'), {
    timestamp: Math.floor(now / 1000),
    ppg_ir: latestPpg,
    eda: latestEda
  }).catch(err => console.error("Firebase push failed:", err));
}

export function disconnectBLE() {
  if (bleDevice && bleDevice.gatt?.connected) {
    bleDevice.gatt.disconnect();
  }
  useSensorStore.getState().setStatus('disconnected');
}
