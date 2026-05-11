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
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-ink-muted">
        <div className="size-10 rounded-xl border border-surface-border bg-surface-elevated flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 17 9 11 13 15 21 7" />
            <polyline points="14 7 21 7 21 14" />
          </svg>
        </div>
        <p>No activity yet</p>
        <p className="text-[11px] text-ink-muted">Run your first verification to see trends</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: mutedText, fontSize: 11 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: mutedText, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--primary) / 0.25)', strokeWidth: 1 }}
          contentStyle={{
            backgroundColor: tooltipBackground,
            border: `1px solid ${gridColor}`,
            borderRadius: '12px',
            fontSize: '12px',
            color: tooltipText,
            boxShadow: '0 12px 32px -12px rgba(0,0,0,0.5)',
          }}
          formatter={(value: number) => [`${value} verifications`, 'Count']}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="url(#strokeGradient)"
          strokeWidth={2.5}
          fill="url(#activityGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
