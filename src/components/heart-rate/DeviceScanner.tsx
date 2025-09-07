import { useState } from 'react';
import { BluetoothDevice } from '@/types/heart-rate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bluetooth, Loader2, Heart, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceScannerProps {
  onDeviceSelect: (deviceId: string) => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

export function DeviceScanner({ onDeviceSelect, isConnecting, error }: DeviceScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setScanError(null);
    setDevices([]);

    try {
      // Simulate device scan by directly requesting device
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth is not supported on this device');
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['0000180d-0000-1000-8000-00805f9b34fb'] }],
        optionalServices: ['0000180d-0000-1000-8000-00805f9b34fb']
      });

      const heartRateDevice: BluetoothDevice = {
        id: device.id,
        name: device.name || 'Unknown Heart Rate Device',
        connected: false
      };

      setDevices([heartRateDevice]);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotFoundError') {
          setScanError('No heart rate devices found. Make sure your device is nearby and in pairing mode.');
        } else if (error.name === 'NotSupportedError') {
          setScanError('Web Bluetooth is not supported on this browser or device.');
        } else {
          setScanError(error.message);
        }
      } else {
        setScanError('An unknown error occurred while scanning for devices.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (deviceId: string) => {
    try {
      await onDeviceSelect(deviceId);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-athletic rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">Connect Heart Rate Sensor</CardTitle>
          <CardDescription>
            Scan for Bluetooth LE heart rate monitors nearby
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Web Bluetooth Support Check */}
          {!navigator.bluetooth && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Web Bluetooth is not supported on this browser. Please use Chrome, Edge, or Opera on a supported device.
              </AlertDescription>
            </Alert>
          )}

          {/* Scan Button */}
          <Button
            onClick={handleScan}
            disabled={isScanning || !navigator.bluetooth}
            className="w-full bg-gradient-athletic hover:opacity-90 text-white border-0"
            size="lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Bluetooth className="mr-2 h-4 w-4" />
                Scan for Devices
              </>
            )}
          </Button>

          {/* Scan Error */}
          {scanError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{scanError}</AlertDescription>
            </Alert>
          )}

          {/* Connection Error */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Device List */}
          {devices.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Available Devices</h3>
              {devices.map((device) => (
                <Card key={device.id} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-xs text-muted-foreground">{device.id}</p>
                      </div>
                      <Button
                        onClick={() => handleConnect(device.id)}
                        disabled={isConnecting}
                        size="sm"
                        variant="outline"
                      >
                        {isConnecting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Make sure your heart rate sensor is nearby and in pairing mode</p>
            <p>• Compatible with Bluetooth LE heart rate monitors (ANT+ not supported)</p>
            <p>• Works with most fitness trackers and chest straps</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}