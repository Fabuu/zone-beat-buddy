import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { HeartRateReading } from '@/types/heart-rate';
import { Card, CardContent } from '@/components/ui/card';

interface HeartRateChartProps {
  data: HeartRateReading[];
  className?: string;
}

export function HeartRateChart({ data, className }: HeartRateChartProps) {
  const chartData = useMemo(() => {
    if (!data.length) return [];
    
    // Sort by timestamp and create chart points
    const sortedData = [...data].sort((a, b) => a.timestamp - b.timestamp);
    const now = Date.now();
    
    return sortedData.map((reading, index) => ({
      time: Math.round((reading.timestamp - now) / 1000), // Seconds ago (negative)
      bpm: reading.bpm,
      index
    }));
  }, [data]);

  if (!chartData.length) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            Waiting for heart rate data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const minBpm = Math.max(50, Math.min(...chartData.map(d => d.bpm)) - 10);
  const maxBpm = Math.min(220, Math.max(...chartData.map(d => d.bpm)) + 10);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Last 20 Seconds</h3>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis 
                dataKey="time"
                type="number"
                scale="linear"
                domain={[-20, 0]}
                tickFormatter={(value) => `${value}s`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                domain={[minBpm, maxBpm]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                width={30}
              />
              <Line
                type="monotone"
                dataKey="bpm"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}