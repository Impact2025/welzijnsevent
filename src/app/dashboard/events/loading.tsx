export default function EventsLoading() {
  return (
    <div className="p-6 max-w-3xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-36 bg-sand rounded-xl mb-2" />
          <div className="h-4 w-40 bg-sand/60 rounded-full" />
        </div>
        <div className="h-10 w-40 bg-sand rounded-xl" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[80, 60, 44, 56, 72].map((w, i) => (
          <div key={i} className="h-9 bg-sand rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Search */}
      <div className="h-11 bg-white border border-sand rounded-xl mb-5" />

      {/* List */}
      <div className="card-base overflow-hidden">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="px-5 py-4 border-b border-sand/50 last:border-0 flex items-center gap-4">
            <div className="h-10 w-10 bg-sand rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-56 bg-sand rounded-full" />
              <div className="h-3 w-36 bg-sand/60 rounded-full" />
            </div>
            <div className="h-6 w-14 bg-sand rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
