import {
  RadarChart as RechartRadar,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface RadarPoint {
  chapter: string
  score: number
  fullMark: number
}

interface Props {
  data: RadarPoint[]
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: RadarPoint }[] }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#0d1626] border border-cyan-500/30 rounded-lg px-3 py-2 text-xs">
      <div className="text-cyan-300 font-semibold">{d.chapter}</div>
      <div className="text-slate-200 font-mono mt-1">{d.score}% cumplimiento</div>
    </div>
  )
}

export function FSSSRadarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartRadar data={data}>
        <PolarGrid stroke="rgba(6,182,212,0.15)" />
        <PolarAngleAxis
          dataKey="chapter"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#475569', fontSize: 9 }}
          tickCount={5}
        />
        <Radar
          name="Cumplimiento"
          dataKey="score"
          stroke="#06b6d4"
          fill="#06b6d4"
          fillOpacity={0.15}
          strokeWidth={2}
          dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RechartRadar>
    </ResponsiveContainer>
  )
}
