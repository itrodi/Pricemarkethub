import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function Sparkline({
  data,
  color = '#10b981',
  width = 80,
  height = 28,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  // Determine color from trend
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0;
  const lineColor = color === 'auto'
    ? (trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#64748b')
    : color;

  return (
    <div className="sparkline-container" style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
