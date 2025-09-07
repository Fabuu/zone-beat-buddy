import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Activity, Shield, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/scanner');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6 py-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-athletic rounded-full flex items-center justify-center shadow-athletic">
            <Heart className="w-10 h-10 text-white animate-pulse-heart" />
          </div>
          <h1 className="text-3xl font-bold">Heart Zone Trainer</h1>
          <p className="text-lg text-muted-foreground">
            Stay in your optimal training zone with real-time heart rate monitoring and alerts
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Activity className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Real-time Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to Bluetooth LE heart rate sensors for live BPM tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Smart Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Vibration and notifications when you leave your target zone
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Privacy First</h3>
                  <p className="text-sm text-muted-foreground">
                    All data stays on your device - no cloud, no tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This is not a medical device. For training and fitness purposes only. 
            Consult a healthcare professional before starting any exercise program.
          </AlertDescription>
        </Alert>

        {/* Browser Support */}
        {!navigator.bluetooth && (
          <Alert>
            <AlertDescription>
              Web Bluetooth is required for this app. Please use Chrome, Edge, or Opera on a supported device.
            </AlertDescription>
          </Alert>
        )}

        {/* Get Started Button */}
        <Button
          onClick={handleGetStarted}
          className="w-full bg-gradient-athletic hover:opacity-90 text-white border-0 shadow-athletic"
          size="lg"
          disabled={!navigator.bluetooth}
        >
          Get Started
        </Button>

        {/* Compatibility Note */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Compatible with most Bluetooth LE heart rate monitors:</p>
          <p>• Polar chest straps and watches</p>
          <p>• Wahoo fitness sensors</p>
          <p>• Garmin devices with Bluetooth LE</p>
          <p>• Most fitness trackers and smart watches</p>
        </div>
      </div>
    </div>
  );
}