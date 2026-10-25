"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Datum = {
  label: string;
  value: number;
  color: string;
};

export function DonutChart({
  data,
  size = 148,
  thickness = 16,
  centerValue,
  centerLabel,
  className,
}: {
  data: Datum[];
  size?: number;
  thickness?: number;
  centerValue?: string | number;
  centerLabel?: string;
  className?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={data.map((item) => `${item.label}: ${item.value}`).join(", ")}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eef3f3"
          strokeWidth={thickness}
        />
        {data.map((item) => {
          const length = (item.value / total) * circumference;
          const dash = `${Math.max(length - 2, 0)} ${circumference - Math.max(length - 2, 0)}`;
          const circle = (
            <circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += length;
          return circle;
        })}
      </svg>
      {(centerValue !== undefined || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue !== undefined && (
            <span className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="mt-0.5 max-w-[86px] text-[10px] leading-tight text-slate-400">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function DonutLegend({ data }: { data: Datum[] }) {
  return (
    <ul className="space-y-2.5">
      {data.map((item) => (
        <li key={item.label} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-2 text-slate-600">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
          <span className="font-semibold text-ink tabular-nums">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

export type BarSeries = {
  key: string;
  label: string;
  color: string;
};

export function StackedBarChart({
  data,
  series,
  height = 168,
  className,
  valueFormatter = (value: number) => String(value),
}: {
  data: { label: string; values: Record<string, number> }[];
  series: BarSeries[];
  height?: number;
  className?: string;
  valueFormatter?: (value: number) => string;
}) {
  const max = Math.max(
    1,
    ...data.map((item) =>
      series.reduce((sum, entry) => sum + (item.values[entry.key] ?? 0), 0),
    ),
  );
  return (
    <div className={className}>
      <div
        className="flex items-end gap-2 sm:gap-3"
        style={{ height }}
        role="img"
        aria-label={data
          .map((item) => `${item.label}: ${series.map((entry) => item.values[entry.key] ?? 0).join("/")}`)
          .join("; ")}
      >
        {data.map((item) => {
          const total = series.reduce(
            (sum, entry) => sum + (item.values[entry.key] ?? 0),
            0,
          );
          return (
            <div key={item.label} className="group flex h-full flex-1 flex-col justify-end">
              <div className="mb-1.5 text-center text-[9px] font-medium text-slate-400 opacity-0 transition group-hover:opacity-100">
                {valueFormatter(total)}
              </div>
              <div
                className="flex w-full flex-col-reverse overflow-hidden rounded-t-lg transition group-hover:opacity-90"
                style={{ height: `${Math.max((total / max) * 100, 2)}%` }}
              >
                {series.map((entry) => (
                  <div
                    key={entry.key}
                    style={{
                      height: `${total ? ((item.values[entry.key] ?? 0) / total) * 100 : 0}%`,
                      backgroundColor: entry.color,
                    }}
                    title={`${entry.label}: ${valueFormatter(item.values[entry.key] ?? 0)}`}
                  />
                ))}
              </div>
              <span className="mt-2 truncate text-center text-[10px] font-medium text-slate-400">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {series.map((entry) => (
          <span
            key={entry.key}
            className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function GroupedBarChart({
  data,
  series,
  height = 160,
  className,
}: {
  data: { label: string; values: Record<string, number> }[];
  series: BarSeries[];
  height?: number;
  className?: string;
}) {
  const max = Math.max(
    1,
    ...data.flatMap((item) => series.map((entry) => item.values[entry.key] ?? 0)),
  );
  return (
    <div className={className}>
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((item) => (
          <div key={item.label} className="flex h-full flex-1 items-end justify-center gap-1">
            {series.map((entry) => {
              const value = item.values[entry.key] ?? 0;
              return (
                <div
                  key={entry.key}
                  className="w-full max-w-[14px] rounded-t-md transition hover:opacity-80"
                  style={{
                    height: `${Math.max((value / max) * 100, 2)}%`,
                    backgroundColor: entry.color,
                  }}
                  title={`${item.label} · ${entry.label}: ${value}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((item) => (
          <span
            key={item.label}
            className="flex-1 truncate text-center text-[10px] font-medium text-slate-400"
          >
            {item.label}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {series.map((entry) => (
          <span
            key={entry.key}
            className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Sparkline({
  values,
  color = "#159895",
  className,
  width = 110,
  height = 34,
}: {
  values: number[];
  color?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const gradientId = useId().replace(/:/g, "");
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / Math.max(values.length - 1, 1);
  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });
  const area = `0,${height} ${points.join(" ")} ${width},${height}`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HorizontalBar({
  label,
  value,
  max,
  color = "#159895",
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
  suffix?: string;
}) {
  const percent = Math.min((value / Math.max(max, 1)) * 100, 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px]">
        <span className="truncate font-medium text-slate-600">{label}</span>
        <span className="shrink-0 font-semibold text-ink tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
