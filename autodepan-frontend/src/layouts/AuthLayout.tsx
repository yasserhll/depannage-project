import { Outlet } from 'react-router-dom';
import { InstallButton } from '@/components/pwa/InstallButton';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <span className="text-brand-text font-bold text-lg">AutoDepan</span>
        </div>
        <InstallButton />
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-brand-muted text-xs">
        © {new Date().getFullYear()} AutoDepan — Dépannage automobile en temps réel
      </footer>
    </div>
  );
}
