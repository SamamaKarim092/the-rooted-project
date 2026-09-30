export default function SeasonsLoading() {
  return (
    <div className="space-y-8 w-full animate-fade-in select-none">
      {/* Month Navigator Header */}
      <div className="flex items-center justify-between bg-white border border-[#EAE5D8] rounded-3xl p-5 shadow-sm">
        <div className="h-9 w-9 bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl animate-pulse" />
        <div className="h-7 w-44 bg-[#EAE5D8] rounded-xl animate-pulse" />
        <div className="h-9 w-9 bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl animate-pulse" />
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-[#EAE5D8] p-5 space-y-2 shadow-xs"
          >
            <div className="h-3 w-24 bg-[#EAE5D8]/70 rounded-xs animate-pulse" />
            <div className="h-7 w-20 bg-[#EAE5D8] rounded-lg animate-pulse" />
          </div>
        ))}
      </div>

      {/* Calendar Grid Days */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-white border border-[#EAE5D8] p-3 flex flex-col justify-between shadow-xs"
          >
            <div className="h-4 w-6 bg-[#EAE5D8] rounded-md animate-pulse" />
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-[#FAF8F2] rounded-full animate-pulse" />
              <div className="h-1.5 w-3/4 bg-[#FAF8F2] rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
