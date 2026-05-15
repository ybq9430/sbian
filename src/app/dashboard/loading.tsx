export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-white border-b border-gray-200" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse motion-reduce:animate-none space-y-8">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
