import { HeartRateSettings } from '@/types/heart-rate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Vibrate, Timer, Target, Waves } from 'lucide-react';

interface SettingsPanelProps {
  settings: HeartRateSettings;
  onSettingsChange: (settings: Partial<HeartRateSettings>) => void;
  onClose?: () => void;
}

export function SettingsPanel({ settings, onSettingsChange, onClose }: SettingsPanelProps) {
  const handleZoneChange = (minBpm: number, maxBpm: number) => {
    onSettingsChange({
      targetZone: { minBpm, maxBpm }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <div>
              <CardTitle>Heart Rate Settings</CardTitle>
              <CardDescription>Customize your training zone and alerts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Zone Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <Label className="text-sm font-medium">Target Heart Rate Zone</Label>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Minimum BPM: {settings.targetZone.minBpm}
                </Label>
                <Slider
                  value={[settings.targetZone.minBpm]}
                  onValueChange={([value]) => handleZoneChange(value, settings.targetZone.maxBpm)}
                  max={200}
                  min={60}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">
                  Maximum BPM: {settings.targetZone.maxBpm}
                </Label>
                <Slider
                  value={[settings.targetZone.maxBpm]}
                  onValueChange={([value]) => handleZoneChange(settings.targetZone.minBpm, value)}
                  max={220}
                  min={settings.targetZone.minBpm + 10}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Zone:</span>
                <span className="font-medium">
                  {settings.targetZone.minBpm} - {settings.targetZone.maxBpm} BPM
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Alert Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Vibrate className="w-4 h-4" />
              <Label className="text-sm font-medium">Alert Settings</Label>
            </div>

            {/* Vibration Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Vibration Alerts</Label>
                <p className="text-xs text-muted-foreground">Vibrate when leaving target zone</p>
              </div>
              <Switch
                checked={settings.vibrationEnabled}
                onCheckedChange={(checked) => onSettingsChange({ vibrationEnabled: checked })}
              />
            </div>

            {/* Vibration Pattern */}
            {settings.vibrationEnabled && (
              <div>
                <Label className="text-sm">Vibration Pattern</Label>
                <Select
                  value={settings.vibrationPattern}
                  onValueChange={(value: 'short' | 'double' | 'long') => 
                    onSettingsChange({ vibrationPattern: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short pulse</SelectItem>
                    <SelectItem value="double">Double pulse</SelectItem>
                    <SelectItem value="long">Long pulse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Cooldown Period */}
            <div>
              <Label className="text-sm">
                Alert Cooldown: {settings.cooldownSeconds}s
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Time between repeated alerts
              </p>
              <Slider
                value={[settings.cooldownSeconds]}
                onValueChange={([value]) => onSettingsChange({ cooldownSeconds: value })}
                max={60}
                min={5}
                step={5}
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Waves className="w-4 h-4" />
              <Label className="text-sm font-medium">Advanced Settings</Label>
            </div>

            {/* Hysteresis Range */}
            <div>
              <Label className="text-sm">
                Hysteresis Range: ±{settings.hysteresisRange} BPM
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Prevents fluttering between zone states
              </p>
              <Slider
                value={[settings.hysteresisRange]}
                onValueChange={([value]) => onSettingsChange({ hysteresisRange: value })}
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Auto-reconnect */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Auto-reconnect</Label>
                <p className="text-xs text-muted-foreground">Automatically reconnect if disconnected</p>
              </div>
              <Switch
                checked={settings.autoReconnect}
                onCheckedChange={(checked) => onSettingsChange({ autoReconnect: checked })}
              />
            </div>
          </div>

          {onClose && (
            <>
              <Separator />
              <Button onClick={onClose} variant="outline" className="w-full">
                Close Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}