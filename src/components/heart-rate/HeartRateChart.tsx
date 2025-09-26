import { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceArea } from 'recharts';
import { HeartRateReading, HeartRateSettings } from '@/types/heart-rate';
import { Card, CardContent } from '@/components/ui/card';

interface HeartRateChartProps {
  data: HeartRateReading[];
  settings: HeartRateSettings;
  className?: string;
}

export function HeartRateChart({ data, settings, className }: HeartRateChartProps) {
  const chartData = useMemo(() => {
    if (!data.length) return { inZone: [], outZone: [] };
    
    // Sort by timestamp and create chart points
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
    const now = Date.now();
    
    const inZoneData: any[] = [];
    const outZoneData: any[] = [];
    
    sortedData.forEach((reading, index) => {
      const point = {
        time: Math.round((reading.timestamp - now) / 1000), // Seconds ago (negative)
        bpm: reading.bpm,
        index
      };
      
      const isInZone = reading.bpm >= settings.targetZone.minBpm && reading.bpm <= settings.targetZone.maxBpm;
      
      if (isInZone) {
        inZoneData.push(point);
        outZoneData.push({ ...point, bpm: null }); // null to break the line
      } else {
        outZoneData.push(point);
        inZoneData.push({ ...point, bpm: null }); // null to break the line
      }
    });
    
    return { inZone: inZoneData, outZone: outZoneData };
  }, [data, settings.targetZone]);

  if (!data.length) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            Waiting for heart rate data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine all data points for the chart
  const allData = [...chartData.inZone, ...chartData.outZone]
    .filter(point => point.bpm !== null)
    .sort((a, b) => a.time - b.time);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Last 20 Seconds</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={allData} margin={{ top: 10, right: 15, left: 15, bottom: 10 }}>
              <ReferenceArea
                y1={settings.targetZone.minBpm}
                y2={settings.targetZone.maxBpm}
                fill="hsl(var(--primary))"
                fillOpacity={0.1}
                stroke="hsl(var(--primary))"
                strokeOpacity={0.3}
                strokeDasharray="2 2"
              />
              <XAxis 
                dataKey="time"
                type="number"
                scale="linear"
                domain={[-20, 0]}
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <YAxis 
                domain={[50, 200]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                width={30}
              />
              {/* Blue line for out-of-zone values */}
              <Line
                type="monotone"
                dataKey="bpm"
                data={chartData.outZone}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "hsl(var(--primary))" }}
                connectNulls={false}
              />
              {/* Green line for in-zone values */}
              <Line
                type="monotone"
                dataKey="bpm"
                data={chartData.inZone}
                stroke="hsl(var(--zone-in))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "hsl(var(--zone-in))" }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}