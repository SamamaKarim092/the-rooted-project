export default function DashboardLoading() {
  return (
    <div className="space-y-8 w-full animate-fade-in select-none">
      {/* Top Header Capsule Bar Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-2">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-[#EAE5D8] rounded-xl animate-pulse" />
          <div className="h-4 w-40 bg-[#EAE5D8]/70 rounded-lg animate-pulse" />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="h-10 w-28 bg-white border border-[#EAE5D8] rounded-full animate-pulse shadow-xs" />
          <div className="h-10 w-28 bg-white border border-[#EAE5D8] rounded-full animate-pulse shadow-xs" />
          <div className="h-10 w-24 bg-white border border-[#EAE5D8] rounded-full animate-pulse shadow-xs" />
          <div className="h-10 w-10 bg-white border border-[#EAE5D8] rounded-full animate-pulse shadow-xs" />
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Daily Intentions Card (Forest Dark Skeleton) */}
        <div className="rounded-3xl bg-[#1E3127] border border-[#354D40] p-6 sm:p-7 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-7 w-36 bg-[#2A3F34] rounded-lg animate-pulse" />
              <div className="h-6 w-12 bg-[#2A3F34] rounded-full animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-[#2A3F34] rounded-xl animate-pulse" />
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#23372D] border border-[#354D40]/60"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-5 h-5 rounded-full border-2 border-[#354D40] animate-pulse" />
                  <div
                    className={`h-4 bg-[#2A3F34] rounded-md animate-pulse ${
                      i % 2 === 0 ? "w-48" : "w-64"
                    }`}
                  />
                </div>
                <div className="h-6 w-14 bg-[#2A3F34] rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Today's Rituals Card (Cream Skeleton) */}
        <div className="rounded-3xl bg-white border border-[#EAE5D8] p-6 sm:p-7 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-7 w-36 bg-[#EAE5D8] rounded-lg animate-pulse" />
              <div className="h-6 w-14 bg-[#FAF8F2] border border-[#EAE5D8] rounded-full animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl animate-pulse" />
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8]/80"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-5 h-5 rounded-full border-2 border-[#EAE5D8] animate-pulse" />
                  <div
                    className={`h-4 bg-[#EAE5D8] rounded-md animate-pulse ${
                      i % 2 === 0 ? "w-52" : "w-40"
                    }`}
                  />
                </div>
                <div className="h-6 w-16 bg-[#EAE5D8]/70 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Left: Long-Term Vision Skeleton */}
        <div className="rounded-3xl bg-[#1E3127] border border-[#354D40] p-6 sm:p-7 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-32 bg-[#2A3F34] rounded-lg animate-pulse" />
              <div className="h-5 w-16 bg-[#2A3F34] rounded-full animate-pulse" />
            </div>
            <div className="h-7 w-12 bg-[#2A3F34] rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-5 w-44 bg-[#2A3F34] rounded-md animate-pulse" />
            <div className="h-3 w-full bg-[#23372D] rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-[#354D40] animate-pulse" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-[#2A3F34] animate-pulse" />
                <div className="h-2.5 w-12 bg-[#2A3F34]/60 rounded-xs animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Right: Rest Sanctuary Skeleton */}
        <div className="rounded-3xl bg-white border border-[#EAE5D8] p-6 sm:p-7 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-32 bg-[#EAE5D8] rounded-lg animate-pulse" />
              <div className="h-5 w-20 bg-[#FAF8F2] border border-[#EAE5D8] rounded-full animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-[#FAF8F2] border border-[#EAE5D8] rounded-xl animate-pulse" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-[#EAE5D8]/70 rounded-xs animate-pulse" />
              <div className="h-10 w-28 bg-[#EAE5D8] rounded-xl animate-pulse" />
              <div className="h-4 w-32 bg-[#FAF8F2] border border-[#EAE5D8] rounded-full animate-pulse" />
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-[#FAF8F2] border-t-[#7C9A86]/40 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}
