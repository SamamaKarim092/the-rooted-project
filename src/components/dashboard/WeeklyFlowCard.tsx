"use client";

interface FlowPoint {
  day: string;
  value: number;
}

interface WeeklyFlowCardProps {
  weeklyFlow?: FlowPoint[];
  harmonyGauge?: number;
}

export function WeeklyFlowCard({
  weeklyFlow = [
    { day: "Mon", value: 25 },
    { day: "Tue", value: 38 },
    { day: "Wed", value: 45 },
    { day: "Thu", value: 72 },
    { day: "Fri", value: 68 },
    { day: "Sat", value: 85 },
  ],
  harmonyGauge = 88,
}: WeeklyFlowCardProps) {
  // SVG points calculation for smooth organic watercolor wave
  // Width: 320, Height: 90
  const points = [
    { x: 0, y: 80 },
    { x: 50, y: 70 },
    { x: 100, y: 65 },
    { x: 160, y: 35 },
    { x: 220, y: 48 },
    { x: 270, y: 40 },
    { x: 320, y: 25 },
  ];

  const pathD = `M 0 90 L 0 80 Q 50 68, 100 65 T 160 35 T 220 48 T 270 40 T 320 25 L 320 90 Z`;
  const strokeD = `M 0 80 Q 50 68, 100 65 T 160 35 T 220 48 T 270 40 T 320 25`;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Gauge calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (harmonyGauge / 100) * circumference;

  return (
    <div className="bg-[#FFFFFF] text-[#1A241E] rounded-3xl p-7 md:p-8 border border-[#EAE5D8] shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <h3 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[#1A241E] mb-4">
          Weekly Flow
        </h3>

        {/* Content Container: Wave on left, circular gauge on right */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          {/* Wave Chart */}
          <div className="flex-1 w-full max-w-[340px]">
            <div className="relative h-24 w-full">
              <svg
                viewBox="0 0 320 90"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="terracottaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#D98A6C" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#E5A88B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FAF7F0" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Filled Area */}
                <path d={pathD} fill="url(#terracottaGradient)" />

                {/* Wave Line */}
                <path
                  d={strokeD}
                  fill="none"
                  stroke="#C87452"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* X-Axis Days */}
            <div className="flex justify-between text-xs font-semibold text-[#586B60] mt-3 px-1">
              {days.map((day, idx) => (
                <span key={idx}>{day}</span>
              ))}
            </div>
          </div>

          {/* Harmony Gauge (Circle Meter) */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Dark Forest Background Circle */}
              <div className="absolute inset-1 rounded-full bg-[#1E3127] shadow-sm flex flex-col items-center justify-center text-center p-2">
                <span className="text-[11px] font-medium text-[#FAF7F0] leading-tight">
                  Weekly
                </span>
                <span className="text-[11px] font-medium text-[#FAF7F0] leading-tight">
                  Progress
                </span>
              </div>

              {/* Progress Arc SVG */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  stroke="#2A3F34"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  stroke="#D98A6C"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>

            <span className="text-xs font-medium text-[#586B60] mt-2">
              Harmony gauge
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#EAE5D8]/80 text-xs text-[#586B60]">
        <span>Steady positive momentum across creative and physical routines.</span>
      </div>
    </div>
  );
}
