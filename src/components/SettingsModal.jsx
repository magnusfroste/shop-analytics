import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SettingsModal = ({ isOpen, onClose, onSave, settings, type }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
  };

  const renderSettingFields = () => {
    if (type === 'dataImport') {
      return (
        <div>
          <Label htmlFor="maxRows">Maximum Rows to Import</Label>
          <Input
            id="maxRows"
            type="number"
            value={localSettings.maxRows}
            onChange={(e) => setLocalSettings({...localSettings, maxRows: e.target.value})}
            min="1"
          />
        </div>
      );
    } else if (type === 'analysis') {
      return (
        <div>
          <Label htmlFor="city">City for Weather API</Label>
          <Input
            id="city"
            type="text"
            value={localSettings.city}
            onChange={(e) => setLocalSettings({...localSettings, city: e.target.value})}
            placeholder="Enter city name"
          />
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{type === 'dataImport' ? 'Data Import Settings' : 'Analysis Settings'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {renderSettingFields()}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
