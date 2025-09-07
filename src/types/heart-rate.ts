export interface HeartRateReading {
  bpm: number;
  timestamp: number;
  sensorContact?: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
}

export interface HeartRateZone {
  minBpm: number;
  maxBpm: number;
}

export interface ZoneStatus {
  status: 'below' | 'in' | 'above';
  bpm: number;
  zone: HeartRateZone;
}

export interface HeartRateSettings {
  targetZone: HeartRateZone;
  hysteresisRange: number;
  cooldownSeconds: number;
  vibrationEnabled: boolean;
  vibrationPattern: 'short' | 'double' | 'long';
  autoReconnect: boolean;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
  connected: boolean;
}

export const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
export const HEART_RATE_MEASUREMENT_UUID = '00002a37-0000-1000-8000-00805f9b34fb';
export const CLIENT_CHARACTERISTIC_CONFIG_UUID = '00002902-0000-1000-8000-00805f9b34fb';

export const DEFAULT_SETTINGS: HeartRateSettings = {
  targetZone: { minBpm: 140, maxBpm: 160 },
  hysteresisRange: 3,
  cooldownSeconds: 10,
  vibrationEnabled: true,
  vibrationPattern: 'double',
  autoReconnect: true,
};