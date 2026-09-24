"use client";

import { useMemo } from "react";
import { Moon, Sun, Clock, Sparkles, Edit3, Plus } from "lucide-react";

interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  durationMinutes?: number;
  durationHours?: number;
  quality?: string | null;
  notes?: string | null;
}

interface SleepClockCardProps {
  todayLog: SleepLog | null;
  targetHours?: number;
  yesterdayLog?: SleepLog | null;
  onOpenSleepDialog: (date?: string) => void;
}

function parseTimeToHours(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes("PM");
  const isAM = clean.includes("AM");
  const [hPart, mPart] = clean.replace(/[AP]M/, "").trim().split(":");
  let h = parseInt(hPart, 10) || 0;
  const m = parseInt(mPart, 10) || 0;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h + m / 60;
}

function getAngleFromHours(hours: number): number {
  // 00:00 (Midnight) is at the top (-90 degrees)
  return (hours / 24) * 360 - 90;
}

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const rad = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, sweepAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, startAngle + sweepAngle);
  const largeArcFlag = sweepAngle > 180 ? 1 : 0;

  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 1, end.x, end.y,
  ].join(" ");
}

export function SleepClockCard({
  todayLog,
  targetHours = 8.0,
  yesterdayLog,
  onOpenSleepDialog,
}: SleepClockCardProps) {
  // If todayLog exists, use it; otherwise fallback to yesterdayLog as preview reference
  const activeLog = todayLog || yesterdayLog;
  const isTodayLogged = Boolean(todayLog);

  const bedtimeStr = activeLog?.bedtime || "11:00 PM";
  const wakeTimeStr = activeLog?.wakeTime || "07:30 AM";
  const duration = activeLog?.durationMinutes
    ? Number((activeLog.durationMinutes / 60).toFixed(1))
    : activeLog?.durationHours ?? 8.0;
  const quality = activeLog?.quality || "RESTFUL";

  // Angles for the 24-hour dial
  const bedHours = parseTimeToHours(bedtimeStr);
  const wakeHours = parseTimeToHours(wakeTimeStr);

  const { startAngle, sweepAngle, bedPoint, wakePoint } = useMemo(() => {
    const sAngle = getAngleFromHours(bedHours);
    let sweep = ((wakeHours - bedHours + 24) % 24) / 24 * 360;
    if (sweep <= 0) sweep = (duration / 24) * 360;

    const bPt = polarToCartesian(100, 100, 72, sAngle);
    const wPt = polarToCartesian(100, 100, 72, sAngle + sweep);

    return { startAngle: sAngle, sweepAngle: sweep, bedPoint: bPt, wakePoint: wPt };
  }, [bedHours, wakeHours, duration]);

  const diffFromTarget = Number((duration - targetHours).toFixed(1));

  const qualityBadge = () => {
    switch (quality) {
      case "RESTFUL":
        return { label: "Restful & Deep", bg: "bg-[#EAF3EC] text-[#2D5A3C] border-[#BEDEC7]" };
      case "BALANCED":
        return { label: "Balanced Rest", bg: "bg-[#F3EFE6] text-[#6A5837] border-[#DFD6C3]" };
      case "RESTLESS":
        return { label: "Restless Night", bg: "bg-[#FBF0EA] text-[#8C4626] border-[#F2D0BF]" };
      case "GROGGY":
        return { label: "Heavy / Groggy", bg: "bg-[#F5EFF8] text-[#5B3E69] border-[#DFCFE7]" };
      default:
        return { label: "Restful", bg: "bg-[#EAF3EC] text-[#2D5A3C] border-[#BEDEC7]" };
    }
  };

  const badge = qualityBadge();

  // Dial hour markers
  const dialMarkers = [
    { label: "12a", hour: 0 },
    { label: "3a", hour: 3 },
    { label: "6a", hour: 6 },
    { label: "9a", hour: 9 },
    { label: "12p", hour: 12 },
    { label: "3p", hour: 15 },
    { label: "6p", hour: 18 },
    { label: "9p", hour: 21 },
  ];

  return (
    <div className="bg-[#FFFFFF] text-[#1A241E] rounded-3xl p-7 md:p-8 border border-[#EAE5D8] shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#1A241E]">
              Rest Sanctuary
            </h3>
            {isTodayLogged && (
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                {badge.label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenSleepDialog()}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#F2ECE0] border border-[#EAE5D8] text-[#1E3127] transition-colors cursor-pointer"
            title={isTodayLogged ? "Adjust rest log" : "Log today's sleep"}
          >
            {isTodayLogged ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-[#7C9A86]" />
                <span>Adjust</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-[#D98A6C]" />
                <span>Log Rest</span>
              </>
            )}
          </button>
        </div>

        {/* Content: Left Info + Right Radial Dial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left Column: Metrics & Times */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium text-[#586B60] uppercase tracking-wider block mb-1">
                {isTodayLogged ? "Last Night's Sleep" : "Target Rest"}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl md:text-5xl font-bold text-[#1E3127]">
                  {isTodayLogged ? duration.toFixed(1) : targetHours.toFixed(1)}
                </span>
                <span className="text-lg font-medium text-[#586B60]">hrs</span>
              </div>
            </div>

            {/* Target Comparison Chip */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#586B60]">Target: {targetHours}h</span>
              <span className="text-xs text-[#586B60]">•</span>
              {isTodayLogged ? (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    diffFromTarget >= 0
                      ? "bg-[#EAF3EC] text-[#2D5A3C]"
                      : "bg-[#FBF0EA] text-[#8C4626]"
                  }`}
                >
                  {diffFromTarget >= 0 ? `+${diffFromTarget}h surplus` : `${diffFromTarget}h deficit`}
                </span>
              ) : (
                <span className="text-xs text-[#8C4626] font-medium">Pending check-in</span>
              )}
            </div>

            {/* Bedtime & Wake Time Capsule Chips */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="p-2.5 rounded-2xl bg-[#FAF7F0] border border-[#EAE5D8]">
                <div className="flex items-center gap-1.5 text-xs text-[#586B60] font-medium mb-1">
                  <Moon className="w-3.5 h-3.5 text-[#D98A6C]" />
                  <span>Bedtime</span>
                </div>
                <div className="font-serif text-sm font-bold text-[#1E3127]">
                  {bedtimeStr}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FAF7F0] border border-[#EAE5D8]">
                <div className="flex items-center gap-1.5 text-xs text-[#586B60] font-medium mb-1">
                  <Sun className="w-3.5 h-3.5 text-[#7C9A86]" />
                  <span>Wake Time</span>
                </div>
                <div className="font-serif text-sm font-bold text-[#1E3127]">
                  {wakeTimeStr}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 24-Hour Radial SVG Clock Dial */}
          <div className="flex justify-center items-center">
            <div className="relative w-[190px] h-[190px]">
              <svg viewBox="0 0 200 200" className="w-full h-full select-none">
                <defs>
                  {/* Subtle gradient for sleep arc */}
                  <linearGradient id="sleepArcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D98A6C" />
                    <stop offset="100%" stopColor="#7C9A86" />
                  </linearGradient>
                </defs>

                {/* Dial background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="none"
                  stroke="#F3EFE6"
                  strokeWidth="14"
                />

                {/* Hour Tick Markers around perimeter */}
                {dialMarkers.map((m) => {
                  const angle = getAngleFromHours(m.hour);
                  const outer = polarToCartesian(100, 100, 85, angle);
                  const inner = polarToCartesian(100, 100, 79, angle);
                  const textPos = polarToCartesian(100, 100, 94, angle);
                  return (
                    <g key={m.label}>
                      <line
                        x1={inner.x}
                        y1={inner.y}
                        x2={outer.x}
                        y2={outer.y}
                        stroke="#D4CEBF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <text
                        x={textPos.x}
                        y={textPos.y}
                        fontSize="8"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#7A8F82"
                        className="font-mono select-none"
                      >
                        {m.label}
                      </text>
                    </g>
                  );
                })}

                {/* Active Sleep Glowing Arc */}
                <path
                  d={describeArc(100, 100, 72, startAngle, sweepAngle)}
                  fill="none"
                  stroke="url(#sleepArcGradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />

                {/* Bedtime Endpoint Dot */}
                <circle
                  cx={bedPoint.x}
                  cy={bedPoint.y}
                  r="4.5"
                  fill="#FFFFFF"
                  stroke="#D98A6C"
                  strokeWidth="2.5"
                />

                {/* Wake Endpoint Dot */}
                <circle
                  cx={wakePoint.x}
                  cy={wakePoint.y}
                  r="4.5"
                  fill="#FFFFFF"
                  stroke="#7C9A86"
                  strokeWidth="2.5"
                />

                {/* Center Core: Duration & Icon */}
                <circle
                  cx="100"
                  cy="100"
                  r="52"
                  fill="#FAF7F0"
                  stroke="#EAE5D8"
                  strokeWidth="1"
                />
                <text
                  x="100"
                  y="92"
                  textAnchor="middle"
                  className="font-serif text-xl font-bold fill-[#1E3127]"
                >
                  {duration.toFixed(1)}h
                </text>
                <text
                  x="100"
                  y="112"
                  textAnchor="middle"
                  fontSize="9"
                  letterSpacing="0.05em"
                  className="uppercase font-semibold fill-[#586B60]"
                >
                  {isTodayLogged ? "Logged" : "Preview"}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#EAE5D8] flex items-center justify-between mt-4">
        <span className="text-xs text-[#586B60]">
          {isTodayLogged ? "Consistent rhythm promotes deep recovery." : "Log sleep each morning for rhythm analytics."}
        </span>
        <button
          type="button"
          onClick={() => onOpenSleepDialog()}
          className="text-xs font-semibold text-[#D98A6C] hover:text-[#1E3127] transition-colors cursor-pointer"
        >
          {isTodayLogged ? "View rhythm details →" : "Record last night →"}
        </button>
      </div>
    </div>
  );
}
