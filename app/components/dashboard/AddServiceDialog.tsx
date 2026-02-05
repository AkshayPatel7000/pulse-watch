import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Service, ServiceType } from "../../lib/types";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    service: Omit<
      Service,
      "id" | "currentStatus" | "lastCheckedAt" | "tenantId"
    >,
  ) => void;
  editService?: Service;
}

export function AddServiceDialog({
  open,
  onOpenChange,
  onSave,
  editService,
}: AddServiceDialogProps) {
  const [name, setName] = useState(editService?.name || "");
  const [url, setUrl] = useState(editService?.url || "");
  const [type, setType] = useState<ServiceType>(
    editService?.type || "frontend",
  );
  const [description, setDescription] = useState(
    editService?.description || "",
  );
  const [isActive, setIsActive] = useState(editService?.isActive ?? true);

  useEffect(() => {
    if (open) {
      setName(editService?.name || "");
      setUrl(editService?.url || "");
      setType(editService?.type || "frontend");
      setDescription(editService?.description || "");
      setIsActive(editService?.isActive ?? true);
    }
  }, [open, editService]);

  const handleSave = () => {
    if (!name || !url) return;

    onSave({
      name,
      url,
      type,
      description,
      isActive,
    });

    if (!editService) {
      // Reset form only if creating a new service
      setName("");
      setUrl("");
      setType("frontend");
      setDescription("");
      setIsActive(true);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editService ? "Edit Service" : "Add New Service"}
          </DialogTitle>
          <DialogDescription>
            Configure a new service endpoint to monitor. We&apos;ll check it
            every 10 minutes from multiple regions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              placeholder="e.g., Main Website"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com/health"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as ServiceType)}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend / API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this service"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="active-monitor" className="text-sm font-medium">
                Active Monitoring
              </Label>
              <p className="text-xs text-muted-foreground">
                Pings will be sent while active
              </p>
            </div>
            <input
              type="checkbox"
              id="active-monitor"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border-input bg-background text-primary focus:ring-ring focus:ring-offset-2 cursor-pointer transition-colors"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !url}>
            {editService ? "Save Changes" : "Add Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
