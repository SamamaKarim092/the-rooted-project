export default function NotesLoading() {
  return (
    <div className="space-y-8 w-full animate-fade-in select-none">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="h-11 w-full sm:w-80 bg-white border border-[#EAE5D8] rounded-2xl animate-pulse" />
        <div className="h-10 w-32 bg-[#1E3127]/80 rounded-2xl animate-pulse" />
      </div>

      {/* Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notes List */}
        <div className="lg:col-span-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white border border-[#EAE5D8] space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-[#EAE5D8] rounded-md animate-pulse" />
                <div className="h-3 w-12 bg-[#EAE5D8]/60 rounded-xs animate-pulse" />
              </div>
              <div className="h-3 w-full bg-[#EAE5D8]/50 rounded-xs animate-pulse" />
              <div className="h-5 w-16 bg-[#FAF8F2] border border-[#EAE5D8] rounded-full animate-pulse" />
            </div>
          ))}
        </div>

        {/* Right Column: Note Editor Canvas */}
        <div className="lg:col-span-8 rounded-3xl bg-white border border-[#EAE5D8] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="h-8 w-64 bg-[#EAE5D8] rounded-xl animate-pulse" />
          <div className="flex items-center gap-2 border-b border-[#EAE5D8]/70 pb-4">
            <div className="h-6 w-20 bg-[#FAF8F2] border border-[#EAE5D8] rounded-full animate-pulse" />
            <div className="h-4 w-28 bg-[#EAE5D8]/60 rounded-md animate-pulse" />
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full bg-[#EAE5D8]/60 rounded-md animate-pulse" />
            <div className="h-4 w-5/6 bg-[#EAE5D8]/60 rounded-md animate-pulse" />
            <div className="h-4 w-4/6 bg-[#EAE5D8]/60 rounded-md animate-pulse" />
            <div className="h-4 w-full bg-[#EAE5D8]/60 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
