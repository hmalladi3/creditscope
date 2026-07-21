import { Dot, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { RatingDto } from '../types/api'
import { displayValueToGrade, toTrendPoints } from './ratingTrend'
import { EmptyState } from './EmptyState'

// @spec FE-UI-007, FE-UI-008
export function RatingTrendChart({ ratings }: { ratings: RatingDto[] }) {
  const points = toTrendPoints(ratings)

  if (points.length === 0) {
    return <EmptyState title="No rating history yet." />
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="ratingDate"
          tickLine={false}
          axisLine={{ stroke: 'var(--color-axis)' }}
          tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
        />
        <YAxis
          dataKey="displayValue"
          domain={[0, 9]}
          ticks={[0, 3, 6, 9]}
          tickFormatter={(v) => displayValueToGrade(v)}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
          width={36}
        />
        <Tooltip
          formatter={(value) => displayValueToGrade(Number(value))}
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}
        />
        <Line
          type="monotone"
          dataKey="displayValue"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={points.length === 1 ? <Dot r={5} fill="var(--color-accent)" /> : { r: 3, fill: 'var(--color-accent)' }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
