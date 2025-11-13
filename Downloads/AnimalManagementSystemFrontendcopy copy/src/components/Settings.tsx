import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import {
  ArrowLeft,
  Save,
  Download,
  Upload,
  Building2,
  Bell,
  Database,
} from 'lucide-react';
import { useFacility } from '../context/FacilityContext';

interface SettingsProps {
  onBack: () => void;
}

type FacilityForm = {
  facilityName: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: string;
};

const formatTimestamp = (date: Date) =>
  date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function Settings({ onBack }: SettingsProps) {
  const { settings, updateSettings, updateNotificationPreference } = useFacility();
  const [form, setForm] = useState<FacilityForm>({
    facilityName: settings.facilityName,
    registrationNumber: settings.registrationNumber,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    operatingHours: settings.operatingHours,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm({
      facilityName: settings.facilityName,
      registrationNumber: settings.registrationNumber,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      operatingHours: settings.operatingHours,
    });
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    updateSettings(form);
    setTimeout(() => setIsSaving(false), 400);
  };

  const handleBackup = () => {
    updateSettings({ lastBackup: formatTimestamp(new Date()) });
  };

  const handleImport = () => {
    // Placeholder hook for data import; would hook into file dialog in production.
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-white text-3xl">⚙ Settings</h1>
          <p className="text-white/80 mt-2">Configure facility details and system preferences.</p>
        </div>

        <Card className="bg-white/95">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <CardTitle>Facility Information</CardTitle>
            </div>
            <CardDescription>Update your facility's basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facility Name</Label>
                <Input value={form.facilityName} onChange={(event) => setForm((prev) => ({ ...prev, facilityName: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input value={form.registrationNumber} onChange={(event) => setForm((prev) => ({ ...prev, registrationNumber: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Operating Hours</Label>
              <Input value={form.operatingHours} onChange={(event) => setForm((prev) => ({ ...prev, operatingHours: event.target.value }))} />
            </div>
            <div className="flex justify-end">
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>Manage how alerts and updates are delivered to staff</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                { key: 'lowStockAlerts', title: 'Low Stock Alerts', description: 'Get notified when inventory items fall below reorder level.' },
                { key: 'healthReminders', title: 'Health Reminders', description: 'Receive reminders for upcoming vaccinations and checkups.' },
                { key: 'breedingAlerts', title: 'Breeding Due Dates', description: 'Alerts for animals approaching delivery dates.' },
                { key: 'feedingReminders', title: 'Feeding Task Reminders', description: 'Daily reminders for pending feeding schedules.' },
                { key: 'emailSummary', title: 'Email Notifications', description: 'Receive daily summary emails.' },
              ] as const
            ).map((toggle) => (
              <div key={toggle.key}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{toggle.title}</Label>
                    <p className="text-sm text-muted-foreground">{toggle.description}</p>
                  </div>
                  <Switch
                    checked={settings.notificationPreferences[toggle.key]}
                    onCheckedChange={(checked) => updateNotificationPreference(toggle.key, checked)}
                  />
                </div>
                <Separator className="my-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/95">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>Backup, import, and export facility data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">Backup Data</CardTitle>
                  <CardDescription>Create a backup of all system data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={handleBackup}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Backup
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">Import Data</CardTitle>
                  <CardDescription>Restore data from a previous backup</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={handleImport}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4>Export Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" size="sm">Export Animals (CSV)</Button>
                <Button variant="outline" size="sm">Export Health Records (CSV)</Button>
                <Button variant="outline" size="sm">Export Inventory (CSV)</Button>
                <Button variant="outline" size="sm">Export Staff List (CSV)</Button>
              </div>
            </div>

            <Separator />

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-800">
                <strong>Last Backup:</strong> {settings.lastBackup}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

