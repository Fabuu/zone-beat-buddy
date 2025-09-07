import { DeviceScanner } from '@/components/heart-rate/DeviceScanner';
import { useHeartRate } from '@/hooks/use-heart-rate';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Scanner() {
  const { connect, isConnecting, error, isConnected } = useHeartRate();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate('/monitor');
    }
  }, [isConnected, navigate]);

  const handleDeviceSelect = async (deviceId: string) => {
    await connect(deviceId);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <DeviceScanner
        onDeviceSelect={handleDeviceSelect}
        isConnecting={isConnecting}
        error={error}
      />
    </div>
  );
}