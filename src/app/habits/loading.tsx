export default function HabitsLoading() {
  return (
    <div className="space-y-8 w-full animate-fade-in select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-8 w-56 bg-[#EAE5D8] rounded-xl animate-pulse" />
          <div className="h-4 w-72 bg-[#EAE5D8]/70 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-[#1E3127]/80 rounded-2xl animate-pulse" />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-20 bg-white border border-[#EAE5D8] rounded-xl animate-pulse shadow-2xs"
          />
        ))}
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-white border border-[#EAE5D8] p-6 space-y-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#7C9A86]/40 animate-pulse" />
                <div className="h-5 w-32 bg-[#EAE5D8] rounded-md animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-[#FAF8F2] border border-[#EAE5D8] rounded-full animate-pulse" />
            </div>

            {/* Streak & Metrics */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8]/60">
              <div className="space-y-1">
                <div className="h-2.5 w-16 bg-[#EAE5D8]/70 rounded-xs animate-pulse" />
                <div className="h-5 w-20 bg-[#EAE5D8] rounded-md animate-pulse" />
              </div>
              <div className="space-y-1 text-right">
                <div className="h-2.5 w-16 bg-[#EAE5D8]/70 rounded-xs animate-pulse" />
                <div className="h-5 w-12 bg-[#EAE5D8] rounded-md animate-pulse ml-auto" />
              </div>
            </div>

            {/* 7-Day Consistency Dot Matrix */}
            <div className="space-y-2">
              <div className="h-3 w-28 bg-[#EAE5D8]/60 rounded-xs animate-pulse" />
              <div className="flex items-center justify-between pt-1">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <div key={d} className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-xl bg-[#FAF8F2] border border-[#EAE5D8] animate-pulse" />
                    <div className="h-2 w-4 bg-[#EAE5D8]/50 rounded-xs animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
