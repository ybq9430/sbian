import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary px-6 py-2.5 rounded-lg">
            Go home
          </Link>
          <Link href="/products" className="btn-secondary px-6 py-2.5 rounded-lg">
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}
