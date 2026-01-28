import { Service, ServiceStatus } from '../../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Activity, AlertTriangle, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { getStatusColor, getStatusLabel, formatRelativeTime } from '../../lib/utils';
import { getOverallStatus, mockDB } from '../../lib/mockData';

interface DashboardOverviewProps {
  services: Service[];
  onServiceClick: (serviceId: string) => void;
}

export function DashboardOverview({ services, onServiceClick }: DashboardOverviewProps) {
  const overallStatus = getOverallStatus(services);
  const upCount = services.filter(s => s.currentStatus === 'up').length;
  const degradedCount = services.filter(s => s.currentStatus === 'degraded').length;
  const downCount = services.filter(s => s.currentStatus === 'down').length;
  
  const recentEvents = mockDB.getAllRecentEvents(10);

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'up':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <Card className={overallStatus === 'up' ? 'border-green-300 bg-green-50' : overallStatus === 'degraded' ? 'border-yellow-300 bg-yellow-50' : 'border-red-300 bg-red-50'}>
        <CardHeader>
          <div className="flex items-center gap-3">
            {getStatusIcon(overallStatus)}
            <div>
              <CardTitle className="text-lg">
                {overallStatus === 'up' ? 'All Systems Operational' : overallStatus === 'degraded' ? 'Partial System Outage' : 'Major System Outage'}
              </CardTitle>
              <CardDescription>
                Monitoring {services.length} services across 5 regions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{services.length}</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Operational</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-green-600">{upCount}</span>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Degraded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-yellow-600">{degradedCount}</span>
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Down</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-red-600">{downCount}</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Current status of all monitored services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map(service => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onServiceClick(service.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(service.currentStatus)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{service.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {service.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{service.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getStatusColor(service.currentStatus)}`}>
                      {getStatusLabel(service.currentStatus)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Checked {formatRelativeTime(service.lastCheckedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest status changes across all services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.map(event => {
                const service = services.find(s => s.id === event.serviceId);
                if (!service) return null;
                
                return (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <TrendingUp className={`w-4 h-4 mt-0.5 ${event.newStatus === 'up' ? 'text-green-600' : event.newStatus === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Status changed from{' '}
                        <span className={getStatusColor(event.previousStatus)}>
                          {getStatusLabel(event.previousStatus)}
                        </span>
                        {' '}to{' '}
                        <span className={getStatusColor(event.newStatus)}>
                          {getStatusLabel(event.newStatus)}
                        </span>
                      </p>
                      {event.affectedRegions && event.affectedRegions.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Affected regions: {event.affectedRegions.join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
