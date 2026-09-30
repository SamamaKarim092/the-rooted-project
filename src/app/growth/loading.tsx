export default function GrowthLoading() {
  return (
    <div className="space-y-8 w-full animate-fade-in select-none">
      <div className="space-y-1.5">
        <div className="h-8 w-52 bg-[#EAE5D8] rounded-xl animate-pulse" />
        <div className="h-4 w-72 bg-[#EAE5D8]/70 rounded-lg animate-pulse" />
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-white border border-[#EAE5D8] p-5 space-y-3 shadow-xs"
          >
            <div className="h-3 w-28 bg-[#EAE5D8]/70 rounded-xs animate-pulse" />
            <div className="h-8 w-20 bg-[#EAE5D8] rounded-lg animate-pulse" />
            <div className="h-3 w-36 bg-[#EAE5D8]/50 rounded-xs animate-pulse" />
          </div>
        ))}
      </div>

      {/* Large Chart Card */}
      <div className="rounded-3xl bg-white border border-[#EAE5D8] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-6 w-44 bg-[#EAE5D8] rounded-lg animate-pulse" />
          <div className="h-7 w-28 bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl animate-pulse" />
        </div>
        <div className="h-64 w-full bg-[#FAF8F2] rounded-2xl flex items-end justify-between p-6 gap-2">
          {Array.from({ length: 14 }).map((_, bar) => (
            <div
              key={bar}
              className="flex-1 bg-[#EAE5D8] rounded-t-lg animate-pulse"
              style={{ height: `${20 + ((bar * 17) % 70)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
