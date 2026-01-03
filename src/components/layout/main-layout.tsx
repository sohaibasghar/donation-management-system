import { Navigation } from './navigation';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 relative">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl"></div>
      </div>
      <Navigation />
      <main className="container mx-auto px-4 py-6 sm:py-10 max-w-7xl relative z-10">
        {children}
      </main>
    </div>
  );
}
