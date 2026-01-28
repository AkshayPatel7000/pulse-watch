"use client";
import { useState } from "react";
import { Service } from "../../lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Bell,
  Mail,
  MessageSquare,
  Save,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AlertsManagementProps {
  services: Service[];
  onUpdateService: (
    serviceId: string,
    updates: Partial<Service>,
  ) => Promise<void>;
}

export function AlertsManagement({
  services,
  onUpdateService,
}: AlertsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Local state for form inputs to avoid re-renders of the whole list on every keystroke
  // We'll use a local state map for edited values
  const [editedValues, setEditedValues] = useState<
    Record<
      string,
      {
        emails?: string;
        slackWebhook?: string;
        notifyOnDown?: boolean;
        notifyOnDegraded?: boolean;
        notifyOnRecovered?: boolean;
      }
    >
  >({});

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  const handleInputChange = (
    serviceId: string,
    field: string,
    value: string | boolean,
  ) => {
    setEditedValues((prev) => ({
      ...prev,
      [serviceId]: {
        ...(prev[serviceId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async (service: Service) => {
    const changes = editedValues[service.id];
    if (!changes) return;

    setSavingId(service.id);
    try {
      const emailList =
        typeof changes.emails === "string"
          ? changes.emails
              .split(",")
              .map((e: string) => e.trim())
              .filter((e: string) => e !== "")
          : service.notificationSettings?.emails || [];

      const notificationSettings = {
        notifyOnDown:
          changes.notifyOnDown ??
          service.notificationSettings?.notifyOnDown ??
          true,
        notifyOnDegraded:
          changes.notifyOnDegraded ??
          service.notificationSettings?.notifyOnDegraded ??
          true,
        notifyOnRecovered:
          changes.notifyOnRecovered ??
          service.notificationSettings?.notifyOnRecovered ??
          true,
        slackWebhook:
          changes.slackWebhook ?? service.notificationSettings?.slackWebhook,
        emails: emailList,
      };

      await onUpdateService(service.id, { notificationSettings });
      toast.success(`Alerts updated for ${service.name}`);

      // Clear local changes for this service
      setEditedValues((prev) => {
        const next = { ...prev };
        delete next[service.id];
        return next;
      });
    } catch (error) {
      console.error("Failed to update alerts:", error);
      toast.error("Failed to update alert settings");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Alert Integrations</h2>
          <p className="text-gray-600 mt-1">
            Configure how you want to be notified when services change status
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search services..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredServices.map((service) => {
          const serviceEdits = editedValues[service.id] || {};
          const currentEmails =
            serviceEdits.emails !== undefined
              ? serviceEdits.emails
              : service.notificationSettings?.emails?.join(", ") || "";
          const currentSlack =
            serviceEdits.slackWebhook !== undefined
              ? serviceEdits.slackWebhook
              : service.notificationSettings?.slackWebhook || "";
          const hasChanges = editedValues[service.id] !== undefined;

          return (
            <Card
              key={service.id}
              className={
                hasChanges ? "border-blue-200 ring-1 ring-blue-100" : ""
              }
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.currentStatus)}
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.url}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasChanges && (
                      <Button
                        size="sm"
                        onClick={() => handleSave(service)}
                        disabled={savingId === service.id}
                      >
                        {savingId === service.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    )}
                    <Badge variant="outline">{service.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Channels */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <Label htmlFor={`emails-${service.id}`}>
                          Email Alerts
                        </Label>
                      </div>
                      <Input
                        id={`emails-${service.id}`}
                        placeholder="alerts@example.com, tech@example.com"
                        value={currentEmails}
                        onChange={(e) =>
                          handleInputChange(
                            service.id,
                            "emails",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                        <Label htmlFor={`slack-${service.id}`}>
                          Slack Webhook
                        </Label>
                      </div>
                      <Input
                        id={`slack-${service.id}`}
                        placeholder="https://hooks.slack.com/services/..."
                        value={currentSlack}
                        onChange={(e) =>
                          handleInputChange(
                            service.id,
                            "slackWebhook",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Rules */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notification Rules
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`down-${service.id}`}
                          checked={
                            serviceEdits.notifyOnDown ??
                            service.notificationSettings?.notifyOnDown ??
                            true
                          }
                          onChange={(e) =>
                            handleInputChange(
                              service.id,
                              "notifyOnDown",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <Label
                          htmlFor={`down-${service.id}`}
                          className="text-xs cursor-pointer"
                        >
                          Down
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`degraded-${service.id}`}
                          checked={
                            serviceEdits.notifyOnDegraded ??
                            service.notificationSettings?.notifyOnDegraded ??
                            true
                          }
                          onChange={(e) =>
                            handleInputChange(
                              service.id,
                              "notifyOnDegraded",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <Label
                          htmlFor={`degraded-${service.id}`}
                          className="text-xs cursor-pointer"
                        >
                          Degraded
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`recovered-${service.id}`}
                          checked={
                            serviceEdits.notifyOnRecovered ??
                            service.notificationSettings?.notifyOnRecovered ??
                            true
                          }
                          onChange={(e) =>
                            handleInputChange(
                              service.id,
                              "notifyOnRecovered",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <Label
                          htmlFor={`recovered-${service.id}`}
                          className="text-xs cursor-pointer"
                        >
                          Recovered
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredServices.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <p className="text-gray-500">
              No services found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
