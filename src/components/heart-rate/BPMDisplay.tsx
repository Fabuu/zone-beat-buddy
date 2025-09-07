import { HeartRateReading, ZoneStatus } from '@/types/heart-rate';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BPMDisplayProps {
  reading: HeartRateReading | null;
  zoneStatus: ZoneStatus | null;
  className?: string;
}

export function BPMDisplay({ reading, zoneStatus, className }: BPMDisplayProps) {
  const getStatusColor = () => {
    if (!zoneStatus) return 'text-muted-foreground';
    
    switch (zoneStatus.status) {
      case 'below':
        return 'text-zone-below';
      case 'in':
        return 'text-zone-in';
      case 'above':
        return 'text-zone-above';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadgeColor = () => {
    if (!zoneStatus) return 'bg-muted';
    
    switch (zoneStatus.status) {
      case 'below':
        return 'bg-zone-below/20 text-zone-below border-zone-below/30';
      case 'in':
        return 'bg-zone-in/20 text-zone-in border-zone-in/30';
      case 'above':
        return 'bg-zone-above/20 text-zone-above border-zone-above/30';
      default:
        return 'bg-muted';
    }
  };

  const getStatusText = () => {
    if (!zoneStatus) return 'Disconnected';
    
    switch (zoneStatus.status) {
      case 'below':
        return 'Below Target Zone';
      case 'in':
        return 'In Target Zone';
      case 'above':
        return 'Above Target Zone';
      default:
        return 'Unknown';
    }
  };

  const shouldPulse = reading && zoneStatus?.status === 'in';

  return (
    <div className={cn('flex flex-col items-center space-y-6', className)}>
      {/* BPM Display */}
      <div className="relative">
        <div 
          className={cn(
            'bpm-display text-8xl md:text-9xl font-black tracking-tight transition-colors duration-300',
            getStatusColor(),
            shouldPulse && 'animate-pulse-heart'
          )}
        >
          {reading ? reading.bpm : '--'}
        </div>
        <div className="text-xl md:text-2xl font-semibold text-muted-foreground mt-2 text-center">
          BPM
        </div>
      </div>

      {/* Heart Icon */}
      <div className="relative">
        <Heart 
          className={cn(
            'w-12 h-12 transition-colors duration-300',
            getStatusColor(),
            shouldPulse && 'animate-pulse-heart'
          )}
          fill="currentColor"
        />
        {reading?.sensorContact && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-zone-in rounded-full animate-pulse" />
        )}
      </div>

      {/* Status Badge */}
      <div className={cn(
        'px-6 py-3 rounded-full border text-sm font-semibold transition-colors duration-300',
        getStatusBadgeColor()
      )}>
        {getStatusText()}
      </div>

      {/* Target Zone Display */}
      {zoneStatus && (
        <div className="text-center text-sm text-muted-foreground">
          Target Zone: {zoneStatus.zone.minBpm} - {zoneStatus.zone.maxBpm} BPM
        </div>
      )}

      {/* Connection Info */}
      {reading && (
        <div className="text-xs text-muted-foreground opacity-50">
          Last reading: {new Date(reading.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}