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
  const [heartRateHistory, setHeartRateHistory] = useState<HeartRateReading[]>([]);

  // Initialize zone monitor
  const [zoneMonitor] = useState(() => new HeartRateZoneMonitor(settings));

  useEffect(() => {
    zoneMonitor.updateSettings(settings);
  }, [settings, zoneMonitor]);

  useEffect(() => {
    // Set up bluetooth service callbacks
    bluetoothService.setOnHeartRateChange((reading: HeartRateReading) => {
      console.log('Heart rate reading received:', reading);
      setCurrentReading(reading);
      
      // Add to history (keep last 20 seconds)
      setHeartRateHistory(prev => {
        const newHistory = [...prev, reading];
        const twentySecondsAgo = Date.now() - 20000;
        return newHistory.filter(r => r.timestamp > twentySecondsAgo);
      });
      
      try {
        const status = zoneMonitor.processHeartRate(reading);
        setZoneStatus(status);
      } catch (error) {
        console.error('Zone monitor error:', error);
      }
      setError(null);
    });

    bluetoothService.setOnConnectionChange((connected: boolean) => {
      console.log('useHeartRate - Connection status changed:', connected);
      setIsConnected(connected);
      setIsConnecting(false);
      
      if (connected) {
        setConnectedDevice(bluetoothService.getConnectedDevice());
        setError(null);
      } else {
        setConnectedDevice(null);
        setCurrentReading(null);
        setZoneStatus(null);
        setHeartRateHistory([]);
        try {
          zoneMonitor.reset();
        } catch (error) {
          console.error('Zone monitor reset error:', error);
        }
      }
    });

    // Check initial connection state
    const initialConnectionState = bluetoothService.isConnected();
    console.log('useHeartRate - Initial connection state:', initialConnectionState);
    if (initialConnectionState) {
      setIsConnected(true);
      setConnectedDevice(bluetoothService.getConnectedDevice());
    }

    // Set up zone monitor callback
    try {
      zoneMonitor.setOnStatusChange((status: ZoneStatus) => {
        setZoneStatus(status);
      });
    } catch (error) {
      console.error('Zone monitor setup error:', error);
    }

    return () => {
      bluetoothService.setOnHeartRateChange(() => {});
      bluetoothService.setOnConnectionChange(() => {});
      try {
        zoneMonitor.setOnStatusChange(() => {});
      } catch (error) {
        console.error('Zone monitor cleanup error:', error);
      }
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
    heartRateHistory,
    scanForDevices,
    connect,
    disconnect,
    updateSettings,
  };
}