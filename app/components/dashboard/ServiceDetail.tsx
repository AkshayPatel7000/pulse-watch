import { Service, RegionalHealth } from '../../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Globe, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  getStatusColor, 
  getStatusLabel, 
  formatRelativeTime, 
  getRegionName, 
  formatUptime, 
  formatResponseTime 
} from '../../lib/utils';
import { mockDB, calculateUptimeStats, getRegionalHealth, generateProbeResults } from '../../lib/mockData';

interface ServiceDetailProps {
  service: Service;
  onBack: () => void;
}

export function ServiceDetail({ service, onBack }: ServiceDetailProps) {
  const probeResults = mockDB.getProbeResults(service.id);
  const statusEvents = mockDB.getStatusEvents(service.id);
  const uptimeStats = calculateUptimeStats(probeResults);
  const regionalHealth = getRegionalHealth(service.id);

  // Prepare chart data (last 24 hours)
  const now = Date.now();
  const last24h = probeResults
    .filter(r => r.startedAt > now - 24 * 60 * 60 * 1000)
    .sort((a, b) => a.startedAt - b.startedAt);

  // Group by timestamp and calculate average response time
  const chartData = last24h.reduce((acc, result) => {
    const timestamp = Math.floor(result.startedAt / (10 * 60 * 1000)) * 10 * 60 * 1000;
    const existing = acc.find(item => item.timestamp === timestamp);
    
    if (existing) {
      existing.totalResponseTime += result.responseTime;
      existing.count += 1;
      existing.responseTime = existing.totalResponseTime / existing.count;
    } else {
      acc.push({
        timestamp,
        responseTime: result.responseTime,
        totalResponseTime: result.responseTime,
        count: 1,
        time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      });
    }
    
    return acc;
  }, [] as any[]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              {getStatusIcon(service.currentStatus)}
              <h2 className="text-2xl font-semibold">{service.name}</h2>
              <Badge variant="outline">{service.type}</Badge>
            </div>
            <p className="text-gray-600 mt-1">{service.url}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-medium ${getStatusColor(service.currentStatus)}`}>
            {getStatusLabel(service.currentStatus)}
          </p>
          <p className="text-sm text-gray-500">
            Last checked {formatRelativeTime(service.lastCheckedAt)}
          </p>
        </div>
      </div>

      {/* Uptime Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">24h Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {formatUptime(uptimeStats.uptime24h)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">7d Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {formatUptime(uptimeStats.uptime7d)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">30d Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">
              {formatUptime(uptimeStats.uptime30d)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Response</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatResponseTime(uptimeStats.avgResponseTime)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time (Last 24 Hours)</CardTitle>
          <CardDescription>Average response time across all regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: number) => [formatResponseTime(value), 'Response Time']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Regional Health */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Health</CardTitle>
          <CardDescription>Current status across all monitoring regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {regionalHealth.map(region => (
              <div
                key={region.region}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{getRegionName(region.region)}</p>
                    <p className="text-sm text-gray-500">{region.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatResponseTime(region.responseTime)}</p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(region.lastChecked)}
                    </p>
                  </div>
                  <Badge 
                    variant={region.status === 'up' ? 'secondary' : region.status === 'degraded' ? 'default' : 'destructive'}
                  >
                    {getStatusLabel(region.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incident History */}
      {statusEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Incident History</CardTitle>
            <CardDescription>Recent status changes and outages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 p-4 rounded-lg border">
                  <Clock className="w-4 h-4 mt-0.5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
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
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
