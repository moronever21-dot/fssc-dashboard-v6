import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

interface TrendPoint {
  label: string
  value: number
  target?: number
}

interface TrendChartProps {
  data: TrendPoint[]
  color?: string
  targetColor?: string
  unit?: string
  height?: number
}

const CustomTooltip = ({ active, payload, label, unit }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string; unit?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d1626] border border-cyan-500/30 rounded-lg px-3 py-2 text-xs">
      <div className="text-slate-400 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-white font-mono">{p.name}: <span className="text-cyan-300">{p.value}{unit ? ` ${unit}` : ''}</span></div>
      ))}
    </div>
  )
}

export function TrendLine({ data, color = '#06b6d4', unit, height = 180 }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        {data.some(d => d.target !== undefined) && (
          <Line type="monotone" dataKey="target" stroke="#475569" strokeDasharray="4 3" strokeWidth={1} dot={false} name="Meta" />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          name="Valor"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ComplianceBar({ data, height = 180 }: { data: TrendPoint[]; height?: number }) {
  const barColor = (v: number) => v >= 90 ? '#22c55e' : v >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" />
        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip unit="%" />} />
        <ReferenceLine y={90} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Cumplimiento">
          {data.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.value)} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
