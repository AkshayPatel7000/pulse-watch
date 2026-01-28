import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Service, ServiceType } from '../../lib/types';

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: Omit<Service, 'id' | 'currentStatus' | 'lastCheckedAt'>) => void;
  editService?: Service;
}

export function AddServiceDialog({ open, onOpenChange, onSave, editService }: AddServiceDialogProps) {
  const [name, setName] = useState(editService?.name || '');
  const [url, setUrl] = useState(editService?.url || '');
  const [type, setType] = useState<ServiceType>(editService?.type || 'frontend');
  const [description, setDescription] = useState(editService?.description || '');

  const handleSave = () => {
    if (!name || !url) return;
    
    onSave({
      name,
      url,
      type,
      description,
    });
    
    // Reset form
    setName('');
    setUrl('');
    setType('frontend');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          <DialogDescription>
            Configure a new service endpoint to monitor. We'll check it every 10 minutes from multiple regions.
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
            <Select value={type} onValueChange={(value) => setType(value as ServiceType)}>
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || !url}>
            {editService ? 'Save Changes' : 'Add Service'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
