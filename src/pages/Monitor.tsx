import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BPMDisplay } from '@/components/heart-rate/BPMDisplay';
import { SettingsPanel } from '@/components/heart-rate/SettingsPanel';
import { HeartRateChart } from '@/components/heart-rate/HeartRateChart';
import { useHeartRate } from '@/hooks/use-heart-rate';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Wifi, WifiOff, Play, Pause, Bluetooth } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Monitor() {
  const {
    isConnected,
    currentReading,
    zoneStatus,
    connectedDevice,
    settings,
    error,
    heartRateHistory,
    disconnect,
    updateSettings,
  } = useHeartRate();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackgroundMode, setIsBackgroundMode] = useState(false);
  const navigate = useNavigate();

  // Debug logging for connection state
  console.log('Monitor - isConnected:', isConnected, 'currentReading:', currentReading, 'connectedDevice:', connectedDevice);

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/');
  };

  const toggleBackgroundMode = () => {
    setIsBackgroundMode(!isBackgroundMode);
    // In a real implementation, this would minimize the UI and continue monitoring
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <WifiOff className="w-16 h-16 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">Connection Lost</h2>
          <p className="text-muted-foreground">
            Your heart rate sensor has been disconnected.
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            Return to Scanner
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              isConnected ? 'bg-zone-in animate-pulse' : 'bg-destructive'
            )} />
            <span className="text-sm font-medium">
              {connectedDevice?.name || 'Heart Rate Monitor'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBackgroundMode}
              className={cn(
                isBackgroundMode && 'bg-primary text-primary-foreground'
              )}
            >
              {isBackgroundMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SettingsPanel
                  settings={settings}
                  onSettingsChange={updateSettings}
                  onClose={() => setIsSettingsOpen(false)}
                />
              </SheetContent>
            </Sheet>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
            >
              <Bluetooth className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4">
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
        <BPMDisplay
          reading={currentReading}
          zoneStatus={zoneStatus}
          className="animate-fade-in-up"
        />
        <HeartRateChart 
          data={heartRateHistory}
          className="w-full max-w-md animate-fade-in-up"
        />
      </div>

      {/* Background Mode Indicator */}
      {isBackgroundMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-athletic">
            Background monitoring active
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {currentReading && (
        <div className="p-4 border-t bg-card/50">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Session Time</div>
              <div className="text-sm font-medium">--:--</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Sensor Contact</div>
              <div className="text-sm font-medium">
                {currentReading.sensorContact ? '✓' : '✗'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}