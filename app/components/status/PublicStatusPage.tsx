import { useState, useEffect } from 'react';
import { Service } from '../../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Activity, CheckCircle2, AlertTriangle, XCircle, Clock, Globe } from 'lucide-react';
import { getStatusColor, getStatusLabel, formatRelativeTime, formatUptime } from '../../lib/utils';
import { getOverallStatus, mockDB, calculateUptimeStats } from '../../lib/mockData';

interface PublicStatusPageProps {
  services: Service[];
}

export function PublicStatusPage({ services }: PublicStatusPageProps) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const overallStatus = getOverallStatus(services);
  const recentEvents = mockDB.getAllRecentEvents(15);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: Service['currentStatus']) => {
    switch (status) {
      case 'up':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getOverallMessage = () => {
    switch (overallStatus) {
      case 'up':
        return 'All Systems Operational';
      case 'degraded':
        return 'Partial System Outage';
      case 'down':
        return 'Major System Outage';
    }
  };

  const getOverallDescription = () => {
    switch (overallStatus) {
      case 'up':
        return 'All services are running smoothly with no reported issues.';
      case 'degraded':
        return 'Some services are experiencing degraded performance. We are actively working on a resolution.';
      case 'down':
        return 'Multiple services are currently experiencing outages. Our team is investigating and working to restore service.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-semibold">System Status</h1>
              <p className="text-sm text-gray-600 mt-1">
                Last updated {formatRelativeTime(lastUpdate)} • Auto-refresh enabled
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Overall Status Banner */}
          <Card className={
            overallStatus === 'up' 
              ? 'border-green-300 bg-green-50' 
              : overallStatus === 'degraded' 
              ? 'border-yellow-300 bg-yellow-50' 
              : 'border-red-300 bg-red-50'
          }>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getStatusIcon(overallStatus)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{getOverallMessage()}</CardTitle>
                  <p className="text-sm text-gray-700">{getOverallDescription()}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
                    <Globe className="w-3 h-3" />
                    <span>Monitored from 5 regions globally</span>
                    <span className="mx-2">•</span>
                    <Clock className="w-3 h-3" />
                    <span>Checked every 10 minutes</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Current Status */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Current Status</h2>
            <div className="space-y-3">
              {services.map(service => {
                const probeResults = mockDB.getProbeResults(service.id);
                const uptimeStats = calculateUptimeStats(probeResults);
                
                return (
                  <Card key={service.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(service.currentStatus)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{service.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {service.type}
                              </Badge>
                            </div>
                            {service.description && (
                              <p className="text-sm text-gray-600">{service.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">30d Uptime</p>
                            <p className="text-sm font-semibold text-green-600">
                              {formatUptime(uptimeStats.uptime30d)}
                            </p>
                          </div>
                          <div>
                            <p className={`font-medium ${getStatusColor(service.currentStatus)}`}>
                              {getStatusLabel(service.currentStatus)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatRelativeTime(service.lastCheckedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Incident History */}
          {recentEvents.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Incidents (Last 30 Days)</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentEvents.map(event => {
                      const service = services.find(s => s.id === event.serviceId);
                      if (!service) return null;

                      return (
                        <div key={event.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            event.newStatus === 'up' 
                              ? 'bg-green-600' 
                              : event.newStatus === 'degraded' 
                              ? 'bg-yellow-600' 
                              : 'bg-red-600'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium mb-1">{service.name}</p>
                                <p className="text-sm text-gray-600">
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
                                  <p className="text-xs text-gray-500 mt-2">
                                    Affected regions: {event.affectedRegions.join(', ')}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                {formatRelativeTime(event.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-2">About This Status Page</h3>
                  <p className="text-sm text-gray-700">
                    This page displays real-time status information for all our services. 
                    Our monitoring system checks each endpoint every 10 minutes from 5 global regions 
                    to ensure accurate availability data. The page automatically refreshes every minute 
                    to provide you with the latest information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
