import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useUIStore } from '@/store/useUIStore';

interface CashflowData {
  month: string;
  income: number;
  outcome: number;
}

interface CashflowChartProps {
  data: CashflowData[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-xl">
      <p className="text-xs font-semibold text-[var(--text-secondary)] mb-2">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-[var(--text-secondary)] capitalize">{entry.name}:</span>
          <span className="font-semibold text-[var(--text-primary)]">
            ₹ {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CashflowChart({ data }: CashflowChartProps) {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(10,10,15,0.06)';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--positive)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--positive)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="outcomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--negative)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--negative)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: textColor }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: textColor }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', color: textColor, paddingTop: '8px' }}
        />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="var(--positive)"
          strokeWidth={2}
          fill="url(#incomeGrad)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--positive)', stroke: 'none' }}
        />
        <Area
          type="monotone"
          dataKey="outcome"
          name="Expenses"
          stroke="var(--negative)"
          strokeWidth={2}
          fill="url(#outcomeGrad)"
          dot={false}
          activeDot={{ r: 4, fill: 'var(--negative)', stroke: 'none' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
