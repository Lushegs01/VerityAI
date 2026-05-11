import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ActivityData {
  date: string
  count: number
}

export default function ActivityChart({ data }: { data: ActivityData[] }) {
  const gridColor = 'hsl(var(--surface-border))'
  const mutedText = 'hsl(var(--ink-muted))'
  const tooltipBackground = 'hsl(var(--surface-elevated))'
  const tooltipText = 'hsl(var(--ink-primary))'

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-ink-muted">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E51E56" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#E51E56" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: mutedText, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: mutedText, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBackground,
            border: `1px solid ${gridColor}`,
            borderRadius: '8px',
            fontSize: '12px',
            color: tooltipText,
          }}
          formatter={(value: number) => [`${value} verifications`, 'Count']}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#E51E56"
          strokeWidth={2}
          fill="url(#activityGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
