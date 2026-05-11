import {
  BarChart,
  Bar,
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
  const gridColor = '#E2E8F0'
  const mutedText = '#475569'
  const tooltipBackground = '#FFFFFF'
  const tooltipText = '#0F172A'

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-ink-muted">
        <div className="flex size-10 items-center justify-center rounded-xl border border-surface-border bg-surface-elevated">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 17 9 11 13 15 21 7" />
            <polyline points="14 7 21 7 21 14" />
          </svg>
        </div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest">No activity yet</p>
        <p className="text-[11px] text-ink-muted">Run your first verification to see trends</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: mutedText, fontSize: 11, fontFamily: 'JetBrains Mono' }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: mutedText, fontSize: 11, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(5, 150, 105, 0.05)' }}
          contentStyle={{
            backgroundColor: tooltipBackground,
            border: `1px solid ${gridColor}`,
            borderRadius: '12px',
            fontSize: '12px',
            color: tooltipText,
            boxShadow: '0 12px 32px -12px rgba(0,0,0,0.15)',
          }}
          formatter={(value: number) => [`${value} verifications`, 'Count']}
        />
        <Bar dataKey="count" fill="url(#activityFill)" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
