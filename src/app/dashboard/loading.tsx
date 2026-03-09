export default function DashboardLoading() {
  return (
    <div className="p-7 max-w-3xl mx-auto animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-3 w-20 bg-sand rounded-full mb-2" />
        <div className="h-8 w-44 bg-sand rounded-xl mb-2" />
        <div className="h-4 w-60 bg-sand/60 rounded-full" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[1, 2, 3].map(i => (
          <div key={i} className="card-base p-5 h-[88px]" />
        ))}
      </div>

      {/* Events list */}
      <div className="card-base overflow-hidden">
        <div className="px-5 py-4 border-b border-sand/50">
          <div className="h-5 w-40 bg-sand rounded-full" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="px-5 py-4 border-b border-sand/50 last:border-0 flex items-center gap-4">
            <div className="h-10 w-10 bg-sand rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-sand rounded-full" />
              <div className="h-3 w-32 bg-sand/60 rounded-full" />
            </div>
            <div className="h-6 w-16 bg-sand rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
