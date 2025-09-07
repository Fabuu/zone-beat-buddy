import { HEART_RATE_SERVICE_UUID, HEART_RATE_MEASUREMENT_UUID, HeartRateReading, BluetoothDevice } from '@/types/heart-rate';

export class BluetoothHeartRateService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onHeartRateChange: ((reading: HeartRateReading) => void) | null = null;
  private onConnectionChange: ((connected: boolean) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth not supported');
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE_UUID] }],
        optionalServices: [HEART_RATE_SERVICE_UUID]
      });

      return [{
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: false
      }];
    } catch (error) {
      console.error('Error scanning for devices:', error);
      throw error;
    }
  }

  async connect(deviceId: string): Promise<void> {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth not supported');
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE_UUID] }],
        optionalServices: [HEART_RATE_SERVICE_UUID]
      });

      this.device = {
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: false
      };

      device.addEventListener('gattserverdisconnected', this.handleDisconnection.bind(this));

      this.server = await device.gatt?.connect();
      if (!this.server) throw new Error('Failed to connect to GATT server');

      const service = await this.server.getPrimaryService(HEART_RATE_SERVICE_UUID);
      this.characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT_UUID);

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateChange.bind(this));

      this.device.connected = true;
      this.reconnectAttempts = 0;
      this.onConnectionChange?.(true);
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.characteristic) {
        await this.characteristic.stopNotifications();
        this.characteristic.removeEventListener('characteristicvaluechanged', this.handleHeartRateChange.bind(this));
      }
      
      if (this.server) {
        this.server.disconnect();
      }
      
      if (this.device) {
        this.device.connected = false;
      }
      
      this.onConnectionChange?.(false);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  private handleDisconnection() {
    if (this.device) {
      this.device.connected = false;
    }
    this.onConnectionChange?.(false);
    
    // Auto-reconnect logic
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => {
        if (this.device) {
          this.connect(this.device.id).catch(console.error);
        }
      }, delay);
    }
  }

  private handleHeartRateChange(event: Event) {
    const characteristic = (event.target as unknown) as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    
    if (!value) return;

    const reading = this.parseHeartRateValue(value);
    this.onHeartRateChange?.(reading);
  }

  private parseHeartRateValue(value: DataView): HeartRateReading {
    const flags = value.getUint8(0);
    const is16Bit = flags & 0x01;
    
    let bpm: number;
    let offset = 1;
    
    if (is16Bit) {
      bpm = value.getUint16(offset, true); // little endian
      offset += 2;
    } else {
      bpm = value.getUint8(offset);
      offset += 1;
    }

    const sensorContact = !!(flags & 0x02);
    let energyExpended: number | undefined;
    let rrIntervals: number[] | undefined;

    // Parse energy expended if present
    if (flags & 0x08) {
      energyExpended = value.getUint16(offset, true);
      offset += 2;
    }

    // Parse RR intervals if present
    if (flags & 0x10) {
      rrIntervals = [];
      while (offset < value.byteLength) {
        const rrInterval = value.getUint16(offset, true);
        rrIntervals.push(rrInterval * 1000 / 1024); // Convert to milliseconds
        offset += 2;
      }
    }

    return {
      bpm,
      timestamp: Date.now(),
      sensorContact,
      energyExpended,
      rrIntervals
    };
  }

  setOnHeartRateChange(callback: (reading: HeartRateReading) => void) {
    this.onHeartRateChange = callback;
  }

  setOnConnectionChange(callback: (connected: boolean) => void) {
    this.onConnectionChange = callback;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.device;
  }

  isConnected(): boolean {
    return this.device?.connected ?? false;
  }
}

export const bluetoothService = new BluetoothHeartRateService();