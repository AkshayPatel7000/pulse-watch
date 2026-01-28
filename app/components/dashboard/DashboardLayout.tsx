import { Activity, BarChart3, Globe, Settings, Home } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: 'overview' | 'services' | 'settings';
  onNavigate: (page: 'overview' | 'services' | 'settings') => void;
}

export function DashboardLayout({ children, currentPage, onNavigate }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold">PulseWatch</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={currentPage === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('overview')}
              >
                <Home className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={currentPage === 'services' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('services')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Services
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('/status', '_blank')}
              >
                <Globe className="w-4 h-4 mr-2" />
                Public Status
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
