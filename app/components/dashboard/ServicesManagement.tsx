"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Service } from "../../lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { AddServiceDialog } from "./AddServiceDialog";
import {
  getStatusColor,
  getStatusLabel,
  formatRelativeTime,
} from "../../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface ServicesManagementProps {
  services: Service[];
  onAddService: (
    service: Omit<
      Service,
      "id" | "currentStatus" | "lastCheckedAt" | "tenantId"
    >,
  ) => void;
  onDeleteService: (serviceId: string) => void;
}

export function ServicesManagement({
  services,
  onAddService,
  onDeleteService,
}: ServicesManagementProps) {
  const router = useRouter();
  const params = useParams();
  const orgName = params?.org_name as string;
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    // Update time asynchronously to avoid cascading render warning
    const timeout = setTimeout(() => {
      setNow(Date.now());
    }, 0);

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const getStatusIcon = (status: Service["currentStatus"]) => {
    switch (status) {
      case "up":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "down":
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const handleDelete = () => {
    if (deleteServiceId) {
      onDeleteService(deleteServiceId);
      setDeleteServiceId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Service Management</h2>
          <p className="text-muted-foreground mt-1">
            Configure and monitor your services
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Services ({services.length})</CardTitle>
          <CardDescription>
            Manage endpoints monitored from 5 global regions every 10 minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No services configured yet</p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Service
                </Button>
              </div>
            ) : (
              services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  {getStatusIcon(service.currentStatus)}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{service.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {service.type}
                      </Badge>
                      <span
                        className={`text-sm ${getStatusColor(service.currentStatus)}`}
                      >
                        {getStatusLabel(service.currentStatus)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.url}
                    </p>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Last checked{" "}
                      {now > 0
                        ? formatRelativeTime(service.lastCheckedAt, now)
                        : "..."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/${orgName}/services/${service.id}`)
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteServiceId(service.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddServiceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSave={onAddService}
      />

      <AlertDialog
        open={!!deleteServiceId}
        onOpenChange={() => setDeleteServiceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service? All historical data
              and monitoring will be removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
