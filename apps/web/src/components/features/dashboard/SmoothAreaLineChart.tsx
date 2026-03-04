'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SeriesConfig<TData extends object> {
  key: keyof TData & string;
  label: string;
  stroke: string;
  fill: string;
}

interface SmoothAreaLineChartProps<TData extends object> {
  data: TData[];
  xKey: keyof TData & string;
  series: SeriesConfig<TData>[];
  height?: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

interface VerticalHoverCursorProps {
  points?: Array<{ x: number; y: number }>;
  height?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-[#1f1f25] px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-300 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400">{item.name}</span>
            <span className="text-sm font-semibold" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalHoverCursor({ points, height = 0 }: VerticalHoverCursorProps) {
  if (!points || points.length === 0) {
    return null;
  }

  const x = points[0].x;
  const yTop = points[0].y;

  return (
    <line
      x1={x}
      x2={x}
      y1={yTop}
      y2={yTop + height}
      stroke="#f97316"
      strokeWidth={1}
      strokeDasharray="4 4"
    />
  );
}

export default function SmoothAreaLineChart<TData extends object>({
  data,
  xKey,
  series,
  height = 260,
}: SmoothAreaLineChartProps<TData>) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#2d2d35" strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis hide domain={['dataMin - 8', 'dataMax + 8']} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={<VerticalHoverCursor />}
            formatter={(value, _name, item) => [value, item.name]}
          />

          {series.map((serie) => (
            <Area
              key={serie.key}
              type="monotone"
              dataKey={serie.key}
              name={serie.label}
              stroke={serie.stroke}
              fill={serie.fill}
              fillOpacity={0.12}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, stroke: serie.stroke, strokeWidth: 2, fill: '#1a1a1f' }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
