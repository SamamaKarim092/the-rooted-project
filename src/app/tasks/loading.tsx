export default function TasksLoading() {
  return (
    <div className="space-y-8 w-full animate-fade-in select-none">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-8 w-48 bg-[#EAE5D8] rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-[#EAE5D8]/70 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-[#1E3127]/80 rounded-2xl animate-pulse" />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-8 w-20 bg-white border border-[#EAE5D8] rounded-xl animate-pulse shadow-2xs"
          />
        ))}
      </div>

      {/* Horizons Sections */}
      <div className="space-y-6">
        {[1, 2].map((group) => (
          <div
            key={group}
            className="rounded-3xl bg-white border border-[#EAE5D8] p-6 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-[#EAE5D8]/70 pb-3">
              <div className="h-5 w-36 bg-[#EAE5D8] rounded-lg animate-pulse" />
              <div className="h-5 w-12 bg-[#FAF8F2] rounded-full animate-pulse" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3].map((t) => (
                <div
                  key={t}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EAE5D8]/60"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-5 h-5 rounded-full border-2 border-[#EAE5D8] animate-pulse" />
                    <div className="space-y-1">
                      <div
                        className={`h-4 bg-[#EAE5D8] rounded-md animate-pulse ${
                          t % 2 === 0 ? "w-56" : "w-40"
                        }`}
                      />
                      <div className="h-3 w-24 bg-[#EAE5D8]/60 rounded-xs animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-[#EAE5D8]/70 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
