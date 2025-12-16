import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '@/hooks/use-theme';
interface ScopeSparklineProps {
  data: { date: string; spent: number }[];
  color: string;
}
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
export function ScopeSparkline({ data, color }: ScopeSparklineProps) {
  const { isDark } = useTheme();
  const colorMap: Record<string, string> = {
    emerald: 'hsl(142.1 76.2% 36.3%)',
    sky: 'hsl(198.3 93.3% 49.6%)',
    amber: 'hsl(38.3 91.6% 55.5%)',
    rose: 'hsl(346.8 83.5% 53.1%)',
    violet: 'hsl(262.1 83.3% 57.8%)',
    indigo: 'hsl(243.8 90.2% 58.4%)',
  };
  const strokeColor = colorMap[color] || colorMap['emerald'];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
      >
        <defs>
          <linearGradient id={`color-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? 'hsl(var(--background))' : '#ffffff',
            borderColor: 'hsl(var(--border))',
            borderRadius: 'var(--radius)',
            fontSize: '12px',
          }}
          labelStyle={{ fontWeight: 'bold' }}
          formatter={(value: number) => [currencyFormatter.format(value), 'Spent']}
        />
        <Area
          type="monotone"
          dataKey="spent"
          stroke={strokeColor}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#color-${color})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}