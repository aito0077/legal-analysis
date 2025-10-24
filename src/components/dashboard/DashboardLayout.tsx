'use client';

import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Resumen general',
  },
  {
    name: 'Riesgos',
    href: '/dashboard/risks',
    icon: AlertTriangle,
    description: 'Gestión de riesgos',
  },
  {
    name: 'Protocolos',
    href: '/dashboard/protocols',
    icon: FileText,
    description: 'Protocolos y controles',
  },
  {
    name: 'Reportes',
    href: '/dashboard/reports',
    icon: BarChart3,
    description: 'Análisis y reportes',
  },
  {
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Configuración de cuenta',
  },
];

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">LegalRisk</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
                {active && <ChevronRight className="h-4 w-4 text-blue-600" />}
              </button>
            );
          })}
        </nav>

        {/* User info and logout (bottom of sidebar) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="mb-3 px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {session?.user?.name || 'Usuario'}
            </p>
            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600 mr-2" />
            <span className="text-lg font-bold text-gray-900">LegalRisk</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Page content */}
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
