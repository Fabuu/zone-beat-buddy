import { useState, useEffect, useCallback } from 'react';
import { HeartRateReading, ZoneStatus, HeartRateSettings, BluetoothDevice, DEFAULT_SETTINGS } from '@/types/heart-rate';
import { bluetoothService } from '@/services/bluetooth-service';
import { HeartRateZoneMonitor } from '@/services/zone-monitor';

export function useHeartRate() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentReading, setCurrentReading] = useState<HeartRateReading | null>(null);
  const [zoneStatus, setZoneStatus] = useState<ZoneStatus | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [settings, setSettings] = useState<HeartRateSettings>(DEFAULT_SETTINGS);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize zone monitor
  const [zoneMonitor] = useState(() => new HeartRateZoneMonitor(settings));

  useEffect(() => {
    zoneMonitor.updateSettings(settings);
  }, [settings, zoneMonitor]);

  useEffect(() => {
    // Set up bluetooth service callbacks
    bluetoothService.setOnHeartRateChange((reading: HeartRateReading) => {
      setCurrentReading(reading);
      const status = zoneMonitor.processHeartRate(reading);
      setZoneStatus(status);
      setError(null);
    });

    bluetoothService.setOnConnectionChange((connected: boolean) => {
      setIsConnected(connected);
      setIsConnecting(false);
      
      if (connected) {
        setConnectedDevice(bluetoothService.getConnectedDevice());
        setError(null);
      } else {
        setConnectedDevice(null);
        setCurrentReading(null);
        setZoneStatus(null);
        zoneMonitor.reset();
      }
    });

    // Set up zone monitor callback
    zoneMonitor.setOnStatusChange((status: ZoneStatus) => {
      setZoneStatus(status);
    });

    return () => {
      bluetoothService.setOnHeartRateChange(() => {});
      bluetoothService.setOnConnectionChange(() => {});
      zoneMonitor.setOnStatusChange(() => {});
    };
  }, [zoneMonitor]);

  const scanForDevices = useCallback(async (): Promise<BluetoothDevice[]> => {
    try {
      setError(null);
      return await bluetoothService.scanForDevices();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to scan for devices';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const connect = useCallback(async (deviceId: string) => {
    try {
      setIsConnecting(true);
      setError(null);
      await bluetoothService.connect(deviceId);
    } catch (error) {
      setIsConnecting(false);
      const message = error instanceof Error ? error.message : 'Failed to connect to device';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      setError(null);
      await bluetoothService.disconnect();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to disconnect';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<HeartRateSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    isConnected,
    isConnecting,
    currentReading,
    zoneStatus,
    connectedDevice,
    settings,
    error,
    scanForDevices,
    connect,
    disconnect,
    updateSettings,
  };
}