import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Plus, Search, Edit, Trash2, FileText } from 'lucide-react';
import { useFacility } from '../context/FacilityContext';
import type { HealthRecord, HealthRecordStatus, HealthRecordType } from '../types';

interface HealthRecordsProps {
  onBack: () => void;
}

type HealthRecordForm = {
  animalId: string;
  recordType: HealthRecordType;
  description: string;
  date: string;
  veterinarian: string;
  status: HealthRecordStatus;
  nextDueDate: string;
  notes: string;
};

const recordTypes: HealthRecordType[] = ['Vaccination', 'Treatment', 'Checkup', 'Medication', 'Surgery'];
const recordStatuses: HealthRecordStatus[] = ['Scheduled', 'Ongoing', 'Completed'];

const todayIso = () => new Date().toISOString().slice(0, 10);

const defaultForm: HealthRecordForm = {
  animalId: '',
  recordType: 'Checkup',
  description: '',
  date: todayIso(),
  veterinarian: '',
  status: 'Scheduled',
  nextDueDate: '',
  notes: '',
};

export default function HealthRecords({ onBack }: HealthRecordsProps) {
  const { animals, healthRecords, addHealthRecord, updateHealthRecord, deleteHealthRecord } = useFacility();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [form, setForm] = useState<HealthRecordForm>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);

  const [recordBeingEdited, setRecordBeingEdited] = useState<HealthRecord | null>(null);
  const [editForm, setEditForm] = useState<HealthRecordForm>(defaultForm);
  const [editError, setEditError] = useState<string | null>(null);

  const [recordToDelete, setRecordToDelete] = useState<HealthRecord | null>(null);
  const [recordToView, setRecordToView] = useState<HealthRecord | null>(null);

  const animalsById = useMemo(() => new Map(animals.map((animal) => [animal.id, animal])), [animals]);

  const filteredRecords = useMemo(
    () =>
      healthRecords.filter((record) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        const animal = animalsById.get(record.animalId);
        return (
          record.id.toLowerCase().includes(term) ||
          record.description.toLowerCase().includes(term) ||
          record.veterinarian.toLowerCase().includes(term) ||
          record.recordType.toLowerCase().includes(term) ||
          (animal && animal.name.toLowerCase().includes(term))
        );
      }),
    [healthRecords, searchTerm, animalsById]
  );

  const stats = useMemo(() => {
    return {
      total: healthRecords.length,
      vaccinations: healthRecords.filter((record) => record.recordType === 'Vaccination').length,
      treatments: healthRecords.filter((record) => record.recordType === 'Treatment').length,
      scheduled: healthRecords.filter((record) => record.status === 'Scheduled').length,
    };
  }, [healthRecords]);

  const resetAddForm = () => {
    setForm({ ...defaultForm, date: todayIso() });
    setFormError(null);
  };

  const validateForm = (data: HealthRecordForm, setError: (message: string | null) => void) => {
    if (!data.animalId) {
      setError('Select an animal to attach this record to.');
      return false;
    }
    if (!data.description.trim()) {
      setError('Description is required.');
      return false;
    }
    if (!data.veterinarian.trim()) {
      setError('Veterinarian is required.');
      return false;
    }
    if (!data.date) {
      setError('Date is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleAddRecord = () => {
    if (!validateForm(form, setFormError)) return;

    addHealthRecord({
      animalId: form.animalId,
      recordType: form.recordType,
      description: form.description.trim(),
      date: form.date,
      veterinarian: form.veterinarian.trim(),
      status: form.status,
      nextDueDate: form.nextDueDate || undefined,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
    });

    setIsAddDialogOpen(false);
    resetAddForm();
  };

  const handleEditClick = (record: HealthRecord) => {
    setRecordBeingEdited(record);
    setEditForm({
      animalId: record.animalId,
      recordType: record.recordType,
      description: record.description,
      date: record.date,
      veterinarian: record.veterinarian,
      status: record.status,
      nextDueDate: record.nextDueDate ?? '',
      notes: record.notes ?? '',
    });
    setEditError(null);
  };

  const handleUpdateRecord = () => {
    if (!recordBeingEdited) return;
    if (!validateForm(editForm, setEditError)) return;

    updateHealthRecord(recordBeingEdited.id, {
      animalId: editForm.animalId,
      recordType: editForm.recordType,
      description: editForm.description.trim(),
      date: editForm.date,
      veterinarian: editForm.veterinarian.trim(),
      status: editForm.status,
      nextDueDate: editForm.nextDueDate || undefined,
      notes: editForm.notes.trim() ? editForm.notes.trim() : undefined,
    });

    setRecordBeingEdited(null);
  };

  const statusVariant = (status: HealthRecordStatus) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'Ongoing':
        return 'secondary';
      case 'Scheduled':
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl">🏥 Health Records</h1>
            <p className="text-white/80">Track vaccinations, treatments, and medical history.</p>
            <p className="text-white/70 text-sm">Upcoming appointments: {stats.scheduled}</p>
          </div>
        </div>

        {/* Actions */}
        <Card className="bg-white/95">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search records by animal, vet, description, or type"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  resetAddForm();
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Health Record
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardDescription>Total Records</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardDescription>Vaccinations</CardDescription>
              <CardTitle className="text-2xl">{stats.vaccinations}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardDescription>Treatments</CardDescription>
              <CardTitle className="text-2xl">{stats.treatments}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <CardDescription>Scheduled</CardDescription>
              <CardTitle className="text-2xl text-orange-600">{stats.scheduled}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Health Records</CardTitle>
            <CardDescription>All medical records for animals</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Animal</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Veterinarian</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const animal = animalsById.get(record.animalId);
                  return (
                    <TableRow key={record.id} className="hover:bg-emerald-50/40">
                      <TableCell>{record.id}</TableCell>
                      <TableCell>{animal ? `${animal.id} - ${animal.name}` : record.animalId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.recordType}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">{record.description}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.veterinarian}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(record.status) as any}>{record.status}</Badge>
                      </TableCell>
                      <TableCell>{record.nextDueDate ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setRecordToView(record)}>
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditClick(record)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => setRecordToDelete(record)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No health records match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => (!open ? setIsAddDialogOpen(false) : setIsAddDialogOpen(true))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Health Record</DialogTitle>
            <DialogDescription>Record vaccination, treatment, or checkup details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Animal</Label>
              <Select value={form.animalId} onValueChange={(value) => setForm((prev) => ({ ...prev, animalId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.id} - {animal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Record Type</Label>
              <Select value={form.recordType} onValueChange={(value) => setForm((prev) => ({ ...prev, recordType: value as HealthRecordType }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Next Due Date</Label>
              <Input type="date" value={form.nextDueDate} onChange={(event) => setForm((prev) => ({ ...prev, nextDueDate: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Veterinarian</Label>
              <Input
                placeholder="e.g., Dr. Emily Smith"
                value={form.veterinarian}
                onChange={(event) => setForm((prev) => ({ ...prev, veterinarian: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as HealthRecordStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {recordStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the treatment, vaccine, or checkup"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes for this record"
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAddRecord}>
              Save Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={Boolean(recordBeingEdited)} onOpenChange={(open) => !open && setRecordBeingEdited(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Health Record</DialogTitle>
            <DialogDescription>Update medical details</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Animal</Label>
              <Select value={editForm.animalId} onValueChange={(value) => setEditForm((prev) => ({ ...prev, animalId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.id} - {animal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Record Type</Label>
              <Select value={editForm.recordType} onValueChange={(value) => setEditForm((prev) => ({ ...prev, recordType: value as HealthRecordType }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={editForm.date} onChange={(event) => setEditForm((prev) => ({ ...prev, date: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Next Due Date</Label>
              <Input
                type="date"
                value={editForm.nextDueDate}
                onChange={(event) => setEditForm((prev) => ({ ...prev, nextDueDate: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Veterinarian</Label>
              <Input
                value={editForm.veterinarian}
                onChange={(event) => setEditForm((prev) => ({ ...prev, veterinarian: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm((prev) => ({ ...prev, status: value as HealthRecordStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {recordStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={editForm.description} onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notes</Label>
              <Textarea value={editForm.notes} onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))} />
            </div>
          </div>
          {editError && <p className="text-sm text-red-600">{editError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRecordBeingEdited(null)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleUpdateRecord}>
              Update Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={Boolean(recordToView)} onOpenChange={(open) => !open && setRecordToView(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Health Record Details</DialogTitle>
            <DialogDescription>ID: {recordToView?.id}</DialogDescription>
          </DialogHeader>
          {recordToView && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Animal</p>
                  <p className="font-medium">
                    {recordToView.animalId} - {animalsById.get(recordToView.animalId)?.name ?? 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{recordToView.recordType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{recordToView.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Veterinarian</p>
                  <p className="font-medium">{recordToView.veterinarian}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={statusVariant(recordToView.status) as any}>{recordToView.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Due</p>
                  <p className="font-medium">{recordToView.nextDueDate ?? '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium whitespace-pre-wrap">{recordToView.description}</p>
              </div>
              {recordToView.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium whitespace-pre-wrap">{recordToView.notes}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setRecordToView(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={Boolean(recordToDelete)} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete health record?</AlertDialogTitle>
            <AlertDialogDescription>
              This record will be removed permanently. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className=" bg-white px-3 py-1.5 text-sm text-red-600 
border border-gray rounded-lg 
hover:border-red-400 hover:bg-red-50 
transition-all duration-200"
              onClick={() => {
                if (recordToDelete) {
                  deleteHealthRecord(recordToDelete.id);
                }
                setRecordToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

