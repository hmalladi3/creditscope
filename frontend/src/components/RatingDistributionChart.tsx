import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { GRADE_ORDER, type RatingDistributionBucket } from '../types/api'

// @spec FE-UI-003
// A single measure (company count) across an already-labeled ordered category
// (grade) — per the dataviz method's own "pick the simplest form" guidance, a
// single accent hue is correct here; a second (e.g. red-to-green) encoding would
// be reaching for a dimension the chart doesn't need, since the axis labels
// already carry the ordinal identity.
export function RatingDistributionChart({ buckets }: { buckets: RatingDistributionBucket[] }) {
  const byGrade = new Map(buckets.map((b) => [b.grade, b.count]))
  const data = GRADE_ORDER.map((grade) => ({ grade, count: byGrade.get(grade) ?? 0 }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-gridline)" />
        <XAxis
          dataKey="grade"
          tickLine={false}
          axisLine={{ stroke: 'var(--color-axis)' }}
          tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
          width={28}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-accent-ring)' }}
          contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}
        />
        <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
