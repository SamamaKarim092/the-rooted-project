export default function MilestonesLoading() {
  return (
    <div className="space-y-8 w-full animate-fade-in select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-8 w-52 bg-[#EAE5D8] rounded-xl animate-pulse" />
          <div className="h-4 w-72 bg-[#EAE5D8]/70 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-[#1E3127]/80 rounded-2xl animate-pulse" />
      </div>

      {/* Milestone Cards */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-3xl bg-white border border-[#EAE5D8] p-6 sm:p-8 space-y-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-44 bg-[#EAE5D8] rounded-lg animate-pulse" />
                <div className="h-6 w-16 bg-[#FAF8F2] border border-[#EAE5D8] rounded-full animate-pulse" />
              </div>
              <div className="h-6 w-12 bg-[#FAF8F2] border border-[#EAE5D8] rounded-lg animate-pulse" />
            </div>

            {/* Progress bar */}
            <div className="h-2.5 w-full bg-[#FAF8F2] rounded-full overflow-hidden">
              <div
                className={`h-full bg-[#7C9A86]/40 animate-pulse ${
                  i === 1 ? "w-2/3" : "w-1/3"
                }`}
              />
            </div>

            {/* Milestone Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8]/60 space-y-2"
                >
                  <div className="h-3 w-16 bg-[#EAE5D8]/60 rounded-xs animate-pulse" />
                  <div className="h-4 w-28 bg-[#EAE5D8] rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
