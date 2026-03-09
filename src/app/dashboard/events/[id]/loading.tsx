export default function EventDetailLoading() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen animate-pulse">
      {/* Header */}
      <div className="bg-terra-500/30 px-4 pt-10 pb-6">
        <div className="h-4 w-16 bg-white/30 rounded-full mb-4" />
        <div className="h-6 w-52 bg-white/30 rounded-xl mb-2" />
        <div className="h-4 w-40 bg-white/20 rounded-full mb-1" />
        <div className="h-4 w-36 bg-white/20 rounded-full" />
      </div>

      {/* Tabs */}
      <div className="border-b border-sand px-4">
        <div className="flex gap-4 py-3">
          {[64, 72, 56, 80, 56].map((w, i) => (
            <div key={i} className="h-4 bg-sand rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Sessions */}
      <div className="px-4 pt-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="card-base p-4 space-y-2">
            <div className="h-4 w-40 bg-sand rounded-full" />
            <div className="h-3 w-28 bg-sand/60 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
