import { HeartRateReading, HeartRateZone, ZoneStatus, HeartRateSettings } from '@/types/heart-rate';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';

export class HeartRateZoneMonitor {
  private currentStatus: ZoneStatus['status'] = 'in';
  private lastAlertTime = 0;
  private consecutiveOutOfZone = 0;
  private settings: HeartRateSettings;
  private onStatusChange: ((status: ZoneStatus) => void) | null = null;

  constructor(settings: HeartRateSettings) {
    this.settings = settings;
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    try {
      await LocalNotifications.requestPermissions();
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
    }
  }

  updateSettings(settings: HeartRateSettings) {
    this.settings = settings;
  }

  processHeartRate(reading: HeartRateReading): ZoneStatus {
    const status = this.determineZoneStatus(reading.bpm);
    
    if (status.status !== this.currentStatus) {
      if (status.status === 'in') {
        // Entering zone - reset counter
        this.consecutiveOutOfZone = 0;
      } else {
        // Out of zone - increment counter
        this.consecutiveOutOfZone++;
        
        // Only trigger alert if we've been out of zone for at least 2 consecutive readings
        // and cooldown period has passed
        if (this.consecutiveOutOfZone >= 2 && this.shouldTriggerAlert()) {
          this.triggerZoneAlert(status);
          this.lastAlertTime = Date.now();
        }
      }
      
      this.currentStatus = status.status;
    }

    this.onStatusChange?.(status);
    return status;
  }

  private determineZoneStatus(bpm: number): ZoneStatus {
    const { targetZone, hysteresisRange } = this.settings;
    const lowerBound = targetZone.minBpm - hysteresisRange;
    const upperBound = targetZone.maxBpm + hysteresisRange;

    let status: ZoneStatus['status'];
    
    if (bpm < lowerBound) {
      status = 'below';
    } else if (bpm > upperBound) {
      status = 'above';
    } else {
      status = 'in';
    }

    return {
      status,
      bpm,
      zone: targetZone
    };
  }

  private shouldTriggerAlert(): boolean {
    const timeSinceLastAlert = Date.now() - this.lastAlertTime;
    return timeSinceLastAlert >= this.settings.cooldownSeconds * 1000;
  }

  private async triggerZoneAlert(status: ZoneStatus) {
    if (!this.settings.vibrationEnabled) return;

    try {
      // Trigger haptic feedback
      await this.triggerVibration();
      
      // Show notification
      await this.showNotification(status);
    } catch (error) {
      console.error('Failed to trigger zone alert:', error);
    }
  }

  private async triggerVibration() {
    const pattern = this.settings.vibrationPattern;
    
    switch (pattern) {
      case 'short':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'double':
        await Haptics.impact({ style: ImpactStyle.Medium });
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Medium }), 150);
        break;
      case 'long':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 200);
        setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 400);
        break;
    }
  }

  private async showNotification(status: ZoneStatus) {
    const title = 'Heart Rate Alert';
    const body = status.status === 'above' 
      ? `Heart rate too high: ${status.bpm} BPM (Target: ${status.zone.minBpm}-${status.zone.maxBpm})`
      : `Heart rate too low: ${status.bpm} BPM (Target: ${status.zone.minBpm}-${status.zone.maxBpm})`;

    await LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id: Date.now(),
        schedule: { at: new Date(Date.now() + 100) }
      }]
    });
  }

  setOnStatusChange(callback: (status: ZoneStatus) => void) {
    this.onStatusChange = callback;
  }

  getCurrentStatus(): ZoneStatus['status'] {
    return this.currentStatus;
  }

  reset() {
    this.currentStatus = 'in';
    this.consecutiveOutOfZone = 0;
    this.lastAlertTime = 0;
  }
}