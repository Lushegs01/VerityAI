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
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2535" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#4B5568', fontSize: 12 }}
          axisLine={{ stroke: '#1E2535' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#4B5568', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161B27',
            border: '1px solid #1E2535',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#F0F4FF',
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
