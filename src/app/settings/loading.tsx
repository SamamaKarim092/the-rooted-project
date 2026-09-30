export default function SettingsLoading() {
  return (
    <div className="space-y-8 w-full animate-fade-in max-w-4xl select-none">
      <div className="space-y-1.5">
        <div className="h-8 w-40 bg-[#EAE5D8] rounded-xl animate-pulse" />
        <div className="h-4 w-60 bg-[#EAE5D8]/70 rounded-lg animate-pulse" />
      </div>

      {/* Profile Card Skeleton */}
      <div className="rounded-3xl bg-white border border-[#EAE5D8] p-6 sm:p-8 flex items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#EAE5D8] animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-40 bg-[#EAE5D8] rounded-md animate-pulse" />
          <div className="h-3.5 w-56 bg-[#EAE5D8]/70 rounded-xs animate-pulse" />
        </div>
      </div>

      {/* Connectors Card Skeleton */}
      <div className="rounded-3xl bg-white border border-[#EAE5D8] p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-[#EAE5D8] rounded-lg animate-pulse" />
          <div className="h-8 w-28 bg-[#1E3127]/80 rounded-xl animate-pulse" />
        </div>
        <div className="h-16 w-full bg-[#FAF8F2] border border-[#EAE5D8] rounded-2xl animate-pulse" />
      </div>

      {/* Settings Rows */}
      <div className="rounded-3xl bg-white border border-[#EAE5D8] p-6 space-y-4 shadow-sm">
        {[1, 2, 3].map((r) => (
          <div
            key={r}
            className="flex items-center justify-between py-3 border-b border-[#EAE5D8]/60 last:border-0"
          >
            <div className="space-y-1">
              <div className="h-4 w-36 bg-[#EAE5D8] rounded-md animate-pulse" />
              <div className="h-3 w-52 bg-[#EAE5D8]/60 rounded-xs animate-pulse" />
            </div>
            <div className="h-6 w-12 bg-[#FAF8F2] border border-[#EAE5D8] rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
